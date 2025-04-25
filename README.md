# Pretty Regex 🌈

![GitHub release](https://img.shields.io/github/release/SilmiBisyari/pretty-regex.svg)
![GitHub issues](https://img.shields.io/github/issues/SilmiBisyari/pretty-regex.svg)
![GitHub stars](https://img.shields.io/github/stars/SilmiBisyari/pretty-regex.svg)

Welcome to **Pretty Regex**! This tool helps you print regular expressions with syntax highlighting right in your terminal. It is designed to assist with debugging, visually inspecting, and understanding complex regex patterns. 

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Syntax Highlighting**: Enjoy a colorful display of your regex patterns.
- **Terminal Friendly**: Works seamlessly in your terminal environment.
- **Debugging Aid**: Easily spot issues in your regex with visual cues.
- **User-Friendly**: Simple commands to get started quickly.

## Installation

To get started, you need to download and execute the latest release. Visit the [Releases section](https://github.com/SilmiBisyari/pretty-regex/releases) to find the appropriate file for your system. 

After downloading, follow these steps:

1. Open your terminal.
2. Navigate to the directory where you downloaded the file.
3. Execute the file using the appropriate command for your operating system.

For example, on Unix-based systems, you might run:

```bash
chmod +x pretty-regex
./pretty-regex
```

## Usage

Using Pretty Regex is straightforward. Here’s how to do it:

1. Open your terminal.
2. Run the command followed by your regex pattern.

For example:

```bash
pretty-regex '^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}$'
```

This will print the regex with syntax highlighting.

## Examples

Here are some examples to illustrate how Pretty Regex works:

### Example 1: Email Validation

```bash
pretty-regex '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
```

This regex checks for valid email formats. The output will highlight different parts of the regex for easier understanding.

### Example 2: URL Matching

```bash
pretty-regex 'https?://[^\s/$.?#].[^\s]*'
```

This regex matches URLs. The syntax highlighting will help you see the components clearly.

### Example 3: Phone Number

```bash
pretty-regex '^\+?[1-9]\d{1,14}$'
```

This regex validates international phone numbers. The visual aid helps in spotting errors quickly.

## Contributing

We welcome contributions! Here’s how you can help:

1. **Fork the repository**.
2. **Create a new branch** for your feature or bug fix.
3. **Make your changes** and test thoroughly.
4. **Submit a pull request** with a clear description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, feel free to reach out:

- GitHub: [SilmiBisyari](https://github.com/SilmiBisyari)
- Email: silmibisyari@example.com

---

Thank you for checking out Pretty Regex! For the latest updates, don’t forget to visit the [Releases section](https://github.com/SilmiBisyari/pretty-regex/releases) and download the latest version. Happy regexing! 🎉