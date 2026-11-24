# EVS Mini Project

Geo-tagged campus tree inventory with AI health screening and carbon estimates.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
```

### Running Locally

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```sh
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── lib/               # Utility functions and helpers
├── routes/            # Page routes (TanStack Router)
└── styles.css         # Global styles
public/                # Static assets served at root
```

## Available Scripts

| Script        | Description                              |
| ------------- | ---------------------------------------- |
| `npm run dev` | Start the development server             |
| `npm run build` | Build the production bundle             |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the linter                           |
| `npm run format` | Format code with Prettier              |
| `npm run test` | Run the test suite                       |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.