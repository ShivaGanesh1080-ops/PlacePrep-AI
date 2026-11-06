import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dynamic require to prevent Next.js Turbopack from attempting to bundle external executables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChildProcess = (): any => {
  const req = eval("require");
  return req("child_process");
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, language = "python", input = "" } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code string is required" }, { status: 400 });
    }

    const lang = (language || "python").toLowerCase().trim();

    // Prevent HTML/Web markup from ever executing through Python CLI
    const isHtml =
      lang.includes("html") ||
      lang.includes("htm") ||
      lang.includes("xml") ||
      lang.includes("svg") ||
      code.trim().toLowerCase().startsWith("<!doctype") ||
      code.trim().toLowerCase().startsWith("<html");

    if (isHtml) {
      return NextResponse.json({
        success: true,
        output: "HTML rendered inside live browser preview sandbox.",
        isHtml: true,
        executionTimeMs: 1,
      });
    }

    // Prevent CSS stylesheets from executing as Python
    const isCss =
      lang.includes("css") ||
      lang.includes("scss") ||
      lang.includes("sass") ||
      lang.includes("less") ||
      lang.includes("style");

    if (isCss) {
      return NextResponse.json({
        success: true,
        output: "CSS styles define presentation rules for HTML documents. Include this inside a <style> tag or link it via style.css.",
        isCss: true,
        executionTimeMs: 1,
      });
    }

    // Handle Browser DOM JavaScript (window/document calls that don't run in Node.js CLI)
    const isBrowserDOM =
      (lang.includes("js") || lang.includes("javascript")) &&
      (code.includes("document.") || code.includes("window.") || code.includes("addEventListener") || code.includes("alert("));

    if (isBrowserDOM) {
      return NextResponse.json({
        success: true,
        output: "Client-side DOM Script: Code attaches to the browser window and DOM events. To see this in action, run it inside a web browser with your HTML template.",
        isBrowserDOM: true,
        executionTimeMs: 1,
      });
    }

    let command = "python";
    let ext = "py";

    if (lang.includes("js") || lang.includes("javascript") || lang.includes("node") || lang.includes("ts") || lang.includes("typescript")) {
      command = "node";
      ext = "js";
    } else {
      command = "python";
      ext = "py";
    }

    const tempFileName = `placeprep_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    await fs.writeFile(tempFilePath, code, "utf-8");

    const startTime = Date.now();

    return await new Promise<NextResponse>((resolve) => {
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;

      const cp = getChildProcess();
      const child = cp.spawn(command, [tempFilePath], {
        windowsHide: true,
      });

      const timer = setTimeout(() => {
        isTimedOut = true;
        child.kill();
      }, 7000); // 7s timeout

      if (input && child.stdin) {
        child.stdin.write(input.endsWith("\n") ? input : input + "\n");
        child.stdin.end();
      } else if (child.stdin) {
        child.stdin.end();
      }

      child.stdout.on("data", (data: Buffer | string) => {
        stdout += data.toString();
        if (stdout.length > 50000) {
          stdout = stdout.substring(0, 50000) + "\n...[Output truncated]";
          child.kill();
        }
      });

      child.stderr.on("data", (data: Buffer | string) => {
        stderr += data.toString();
        if (stderr.length > 20000) {
          stderr = stderr.substring(0, 20000) + "\n...[Error truncated]";
        }
      });

      child.on("close", async (exitCode: number | null) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;

        try {
          await fs.unlink(tempFilePath);
        } catch {
          // ignore cleanup error
        }

        if (isTimedOut) {
          resolve(
            NextResponse.json({
              success: false,
              output: stdout,
              error: "Execution Timed Out (7-second safety limit reached. Check for infinite loops or blocking inputs).",
              executionTimeMs,
            })
          );
          return;
        }

        resolve(
          NextResponse.json({
            success: exitCode === 0,
            output: stdout,
            error: stderr ? stderr.trim() : undefined,
            exitCode,
            executionTimeMs,
          })
        );
      });

      child.on("error", async (err: Error) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        try {
          await fs.unlink(tempFilePath);
        } catch {}

        resolve(
          NextResponse.json({
            success: false,
            output: "",
            error: `Failed to execute runtime (${command}): ${err.message}`,
            executionTimeMs,
          })
        );
      });
    });
  } catch (err: unknown) {
    console.error("Code runner error:", err);
    return NextResponse.json(
      { error: "Internal server error executing code" },
      { status: 500 }
    );
  }
}
