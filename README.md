# whatImports: Import Finder Tool

**whatImports** is a powerful CLI tool designed to scan your project and locate files that import a specified package. This can be incredibly useful for identifying dependencies and understanding where specific packages are used across a large codebase.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Alias Setup](#alias-setup)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Multithreaded**: Leverages Node.js `worker_threads` to scan multiple files simultaneously for efficient performance.
- **Multiple File Types**: Supports JavaScript, TypeScript, JSX, Python, Vue files, and `package.json`.
- **Organized Output**: Results are grouped by file type and presented in a clean, table format.
- **Animated Output**: Uses `chalk` and `chalk-animation` to add a visually engaging interface.

---

## Installation

1. **Download the Script**:
   Save the provided code into a file named `whatImports.js`.

2. **Make the Script Executable**:
   Use `chmod` to make `whatImports.js` executable:
   ```bash
   chmod +x whatImports.js
   ```

3. **Install Required Packages**:
   Ensure you have the necessary Node.js packages installed by running:
   ```bash
   npm install
   ```

---

## Usage

The **whatImports** script is straightforward to use:

1. **Basic Command**:
   To find all imports of a specific package, simply provide the package name as an argument:
   ```bash
   ./whatImports.js <package-name>
   ```

   Example:
   ```bash
   ./whatImports.js lodash
   ```

2. **Alias Setup**:
   To simplify usage, you can set up an alias:
   ```bash
   alias whatImports='./whatImports.js'
   ```

   Now, you can use the tool with:
   ```bash
   whatImports lodash
   ```

---

## Configuration

### Thread Count
The script is set to use a default worker count of 16. You can modify the variable `WORKER_COUNT` in the script for different performance needs.

### File Type Patterns
Patterns for different file types are defined within the script, covering JavaScript, TypeScript, Python, and `package.json` files. Modify these patterns directly in the `patterns` object if your project requires additional file types.

---

## Troubleshooting

- **Worker Errors**: If you encounter errors related to workers, ensure that you’re using a Node.js version that supports the `worker_threads` module (Node.js 12+).
- **Permission Denied**: Ensure you’ve made the script executable with `chmod +x`.

---

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to help improve this tool.

---

## License

This project is open-source under the MIT License.
