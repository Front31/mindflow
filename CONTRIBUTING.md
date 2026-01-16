# Contributing to MindFlow

Thank you for your interest in contributing to MindFlow! 🎉

## Code of Conduct

Be respectful, inclusive, and collaborative.

## How to Contribute

### Reporting Bugs

1. Check if the bug already exists in Issues
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### Suggesting Features

1. Check existing feature requests
2. Create an issue with:
   - Clear description of the feature
   - Why it's valuable
   - How it might work
   - Mockups if possible

### Pull Requests

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run dev
   # Test manually in browser
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting
   - `refactor:` - Code restructuring
   - `test:` - Adding tests
   - `chore:` - Maintenance

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create a Pull Request**
   - Describe what changed and why
   - Reference any related issues
   - Add screenshots for UI changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/mindflow.git
cd mindflow

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Code Style

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind CSS for styling
- Keep components small and focused
- Add JSDoc comments for complex functions

### Component Template

```tsx
'use client';

import { memo } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

export default memo(MyComponent);
```

## Areas That Need Help

- 🎨 **Design**: UI/UX improvements
- 🐛 **Bugs**: Fix reported issues
- 📱 **Mobile**: Better mobile experience
- 🌐 **i18n**: Internationalization
- 📚 **Docs**: Better documentation
- ⚡ **Performance**: Optimizations
- 🧪 **Tests**: Add test coverage

## Questions?

- Open a discussion on GitHub
- Tag issues with `question`
- Reach out in pull requests

## Recognition

Contributors will be:
- Listed in README
- Thanked in release notes
- Part of an awesome project!

Thank you for making MindFlow better! 🚀
