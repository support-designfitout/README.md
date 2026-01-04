# Contribution Guidelines

Welcome to the Designfitout-Github project! This guide outlines the standards and processes for contributing to our cloud-agnostic web platform.

## 📋 Prerequisites

Before contributing, ensure you have:
- Node.js installed for running tests
- Git configured with your credentials
- Understanding of web development best practices
- Access to the cloud provider of choice (optional for local development)

## 🧪 Development Workflow

### 1. Running Tests
Always run tests before making changes and before submitting pull requests:

```bash
# Run all validation tests
node test-brand-neutrality.js

# This command validates:
# - Configuration template structure
# - Brand neutrality (no hard-coded platform references)
# - Required file structure
```

### 2. Local Development
```bash
# Clone the repository
git clone https://github.com/support-designfitout/Designfitout-Github.git
cd Designfitout-Github

# Set up configuration (optional)
cp config.template.json config.json
# Edit config.json with your cloud provider settings

# Test the project
node test-brand-neutrality.js

# For local preview (requires Firebase CLI or local server)
# firebase serve
# or use any static file server
```

### 3. Making Changes
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Run tests to ensure quality
node test-brand-neutrality.js

# Commit your changes
git add .
git commit -m "feat: descriptive commit message"

# Push and create pull request
git push origin feature/your-feature-name
```

## 📏 Code Standards

### HTML/CSS/JavaScript Standards
- **Modern Standards**: Use ES6+ JavaScript features
- **Semantic HTML**: Use proper HTML5 semantic elements
- **CSS Architecture**: Use CSS custom properties for theming
- **Performance**: Optimize for Core Web Vitals (LCP, FID, CLS)
- **Accessibility**: Follow WCAG 2.1 guidelines
- **Security**: Maintain Content Security Policy compliance

### Code Structure Requirements
- **Modular Code**: Keep JavaScript modules self-contained
- **Documentation**: Add inline comments for complex logic
- **Consistent Naming**: Use clear, descriptive variable and function names
- **Error Handling**: Implement proper error handling and validation

### Brand Neutrality
**Critical Requirement**: The codebase must remain cloud-agnostic.

- ❌ **Avoid**: Hard-coded references to specific cloud providers
- ❌ **Banned Terms**: `firebase`, `cloudflare`, `ga4`, `gsc` in main files
- ✅ **Use**: Configuration templates and environment variables
- ✅ **Preferred**: Generic cloud service terms

### File Organization
```
public/
├── index.html              # Main landing page
├── ind2x.html             # FitOutLab capsule interface
├── strategic-analysis.js  # Competitor analysis module
└── *.css, *.js           # Additional assets

functions/
└── index.js              # Serverless functions

config.template.json      # Configuration template
```

## 🎯 Contribution Areas

### Frontend Development
- **Video Integration**: Enhance YouTube integration and controls
- **Visual Effects**: Improve glassmorphism and animation effects
- **Responsive Design**: Ensure mobile-first responsive behavior
- **Performance**: Optimize loading times and resource usage

### Backend/Functions
- **Serverless Functions**: Develop cloud-agnostic function implementations
- **API Integration**: Create reusable API connectors
- **Data Processing**: Implement efficient data transformation logic

### Testing & Quality
- **Test Coverage**: Expand validation test scenarios
- **Performance Testing**: Add Core Web Vitals monitoring
- **Security Testing**: Enhance CSP and security validation
- **Cross-browser Testing**: Ensure compatibility across browsers

### Documentation
- **API Documentation**: Document function interfaces
- **Setup Guides**: Improve onboarding documentation
- **Troubleshooting**: Add common issue resolution guides

## 🔧 Testing Requirements

### Required Tests
All contributions must pass the existing test suite:

```bash
node test-brand-neutrality.js
```

This validates:
1. **Configuration Template**: Proper JSON structure and required fields
2. **Brand Neutrality**: No hard-coded platform-specific references
3. **File Structure**: All required files are present and accessible

### Writing New Tests
If adding new functionality, consider extending the test framework:

```javascript
// Example test addition to test-brand-neutrality.js
function testNewFeature() {
    console.log('Testing new feature...');
    // Implementation
    return true; // or false if test fails
}

// Add to tests array in runTests()
```

## 📝 Pull Request Process

### Before Submitting
1. ✅ Run all tests: `node test-brand-neutrality.js`
2. ✅ Test in multiple browsers (Chrome, Firefox, Safari)
3. ✅ Verify responsive design on mobile devices
4. ✅ Check Core Web Vitals performance
5. ✅ Review code for brand neutrality

### Pull Request Requirements
- **Clear Description**: Explain what changes were made and why
- **Test Results**: Include test output showing all tests pass
- **Screenshots**: For UI changes, include before/after screenshots
- **Performance Impact**: Note any performance implications
- **Breaking Changes**: Highlight any breaking changes

### Review Process
1. Automated tests will run on your PR
2. Code review by maintainers
3. Testing on staging environment
4. Approval and merge

## 🚀 Deployment Guidelines

### Staging Deployment
- Test changes in a staging environment first
- Validate all functionality works as expected
- Check performance metrics and Core Web Vitals
- Verify cross-browser compatibility

### Production Deployment
- Only deploy after successful staging tests
- Monitor metrics post-deployment
- Have rollback plan ready
- Update documentation if needed

## 🐛 Bug Reports & Feature Requests

### Bug Reports
Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
- Console errors (if any)

### Feature Requests
Include:
- Clear description of the desired feature
- Use case and business value
- Proposed implementation approach
- Impact on existing functionality

## 📞 Support & Questions

- **Repository**: [support-designfitout/Designfitout-Github](https://github.com/support-designfitout/Designfitout-Github)
- **Technical Lead**: Arun K Ravi (this4arun@gmail.com)
- **Issues**: Use GitHub Issues for bug reports and feature requests

## 🎉 Recognition

Contributors who follow these guidelines and make meaningful contributions will be:
- Added to the project contributors list
- Recognized in release notes
- Invited to participate in project planning discussions

Thank you for contributing to making Designfitout a better platform! 🚀