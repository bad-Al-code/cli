import { Timer } from "./core/timer";

function displayUsage(): void {
  console.log("\nUsage: node dist/main.js <minutes>");
  console.log("Example: node dist/main.js 10");
  console.log("\nOr using npm script");
  console.log("Usage: npm start -- <minutes>");
  console.log("Example: npm start -- 10\n");
}

function parseArguments(): number | null {
  const args = process.argv.slice(2);

  if (args.length !== 1 || args[0] === "--help" || args[0] === "-h") {
    displayUsage();

    return null;
  }

  const durationArg = args[0];
  const durationMinutes = Number(durationArg);

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    console.error(
      `Error: Invalid duration "${durationArg}". Please provide a positive number of minutes.`
    );
    displayUsage();

    return null;
  }

  return durationMinutes;
}

function main() {
  const durationMinutes = parseArguments();

  if (durationMinutes === null) {
    const userRequestedHelp = process.argv
      .slice(2)
      .some((arg) => arg === "--help" || arg === "-h");
    process.exit(userRequestedHelp ? 0 : 1);
  }

  try {
    const timer = new Timer(durationMinutes);

    timer.start();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`An unexpected error occured during timer setup. `, error);
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
