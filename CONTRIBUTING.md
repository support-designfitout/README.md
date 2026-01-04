# Contributing to Designfitout-Github

Welcome to the Designfitout-Github project! This document outlines the guidelines for contributing to our multi-language platform supporting Go services, Ruby clients, and JavaScript frontend components.

## 🏗️ Repository Structure

This repository supports multiple programming languages:
- **Go**: Backend services and billing logic (`lib/` directory)
- **Ruby**: Client libraries and gems (`ruby/` directory) 
- **JavaScript/Node.js**: Frontend and serverless functions (`public/`, `functions/` directories)

## 📋 Prerequisites

### For All Contributors
- Git configured with your credentials
- Understanding of cloud-agnostic development principles
- Familiarity with our brand neutrality requirements

### Language-Specific Requirements

#### Go Development
- Go 1.19 or later
- golangci-lint for code linting
- Understanding of Go modules and testing patterns

#### Ruby Development  
- Ruby 2.7 or later
- Bundler for dependency management
- RSpec for testing (when applicable)

#### JavaScript/Node.js Development
- Node.js 16.x or later
- npm for package management
- Playwright for E2E testing

## 🔄 Development Workflow

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/support-designfitout/Designfitout-Github.git
cd Designfitout-Github

# Install dependencies for all languages
npm install                    # JavaScript dependencies
go mod tidy                   # Go dependencies (when go.mod exists)
bundle install               # Ruby dependencies (when Gemfile exists)
```

### 2. Running Tests

Always run all relevant tests before making changes:

```bash
# Core validation tests (always run first)
node test-brand-neutrality.js

# Language-specific tests
npm run test                  # JavaScript/Playwright tests
go test ./...                # Go tests (when available)
bundle exec rspec            # Ruby tests (when available)

# Complete test suite
npm run test:all             # Runs all JavaScript validation tests
```

### 3. Code Standards

#### Go Code Standards
- Follow standard Go formatting (gofmt)
- Use table-driven tests for comprehensive test coverage
- Include appropriate error handling
- Document exported functions and types

#### Ruby Code Standards
- Follow Ruby community style guide
- Use semantic versioning in version files
- Include appropriate gem specifications
- Write clear, descriptive method names

#### JavaScript Code Standards
- Maintain cloud-agnostic architecture
- No hard-coded cloud provider references
- Use configuration templates for environment-specific settings
- Follow existing code patterns in the repository

### 4. Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes following language-specific standards
# ... edit files ...

# Run pre-commit formatting (when available)
# Go files will be automatically formatted by pre-commit hooks

# Test your changes
node test-brand-neutrality.js
npm run test:all
go test ./...              # If working with Go code
bundle exec rspec          # If working with Ruby code

# Commit your changes
git add .
git commit -m "feat: descriptive commit message"

# Push and create pull request
git push origin feature/your-feature-name
```

## 🧪 Testing Requirements

### Required Tests for All Changes
1. Brand neutrality validation: `node test-brand-neutrality.js`
2. Configuration template validation
3. Cloud-agnostic architecture compliance

### Language-Specific Testing

#### Go Testing
- Use table-driven tests for comprehensive coverage
- Test both success and error cases
- Include benchmarks for performance-critical code
- Example test structure in `lib/billing/compute_test.go`

#### Ruby Testing
- Follow RSpec conventions when applicable
- Test public API methods thoroughly
- Include version compatibility tests

#### JavaScript Testing
- Playwright E2E tests for frontend components
- Unit tests for serverless functions
- Cross-browser compatibility validation

## 📝 Pull Request Guidelines

### Before Submitting
- [ ] All tests pass (`npm run test:all`)
- [ ] Code follows language-specific style guides
- [ ] Brand neutrality compliance verified
- [ ] No hard-coded cloud provider references
- [ ] Documentation updated if needed

### Pull Request Requirements
- **Clear Description**: Explain changes and their purpose
- **Test Results**: Include output from all relevant test suites
- **Language Impact**: Note which languages/components are affected
- **Breaking Changes**: Highlight any breaking changes
- **Performance Impact**: Note any performance implications

### Multi-Language Considerations
- Consider impact across all supported languages
- Update relevant documentation for affected components
- Ensure changes maintain cloud-agnostic principles
- Test integration between language components when applicable

## 🔧 Linting and Code Quality

### Automated Linting
- Go: `golangci-lint` (configured in `.golangci.yml`)
- JavaScript: ESLint (when configured)
- Ruby: RuboCop (when configured)

### Pre-commit Hooks
- Go code formatting via `.githooks/pre-commit`
- Brand neutrality validation
- Configuration template validation

## 🚀 Continuous Integration

Our CI pipeline tests all supported languages:
- Go: Build, lint, and test
- Ruby: Bundle install and test
- JavaScript: Install, lint, and run Playwright tests

All languages must pass their respective CI checks before merging.

## 📚 Additional Resources

- [Development Guide](DEVELOPMENT.md) - Detailed development instructions
- [Cloud Providers Guide](CLOUD_PROVIDERS.md) - Multi-cloud deployment information
- [Brand Neutrality Tests](test-brand-neutrality.js) - Core validation tests
- [Vibe Coding Guide](VIBE_CODING_GUIDE.md) - AI-enhanced development patterns

## 🤝 Getting Help

- Create GitHub issues for bugs or questions
- Follow existing code patterns in each language
- Review test files for examples of expected code structure
- Check documentation for language-specific guidelines

Thank you for contributing to Designfitout-Github! Your contributions help make our multi-language platform better for everyone.