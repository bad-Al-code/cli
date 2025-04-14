function displayUsage(): void {
  console.log("Usage: timer <minutes>");
  console.log("Example: timer 10");
}

function parseArguments(): number | null {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Error: Invalid number of arguments.");
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
  console.log("Timer CLI...");

  const durationMinutes = parseArguments();

  if (durationMinutes === null) {
    process.exit(1);
  }

  console.log(`Timer set for ${durationMinutes} minutes.`);
}

main();
