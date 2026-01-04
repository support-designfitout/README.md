# Playwright Testing Suite

This directory contains the comprehensive Playwright testing suite for the Designfitout-Github project.

## Directory Structure

```
tests/
├── pages/                 # Page Object Model classes
│   ├── base-page.ts      # Base page with common functionality
│   ├── home-page.ts      # Home page (index.html) page object
│   └── fitoutlab-page.ts # FitOutLab page (ind2x.html) page object
├── fixtures/              # Test fixtures and custom test setups
│   └── page-fixtures.ts  # Page object fixtures for tests
├── utils/                 # Utility functions and helpers
│   └── test-helpers.ts   # Common test helper functions
├── *.spec.ts             # Test specification files
├── global-setup.ts       # Global test setup configuration
├── global-teardown.ts    # Global test cleanup configuration
└── README.md             # This file
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npm run install:browsers
   # or
   npx playwright install
   ```

### Test Commands

```bash
# Run all tests (headless mode)
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests with Playwright UI mode
npm run test:ui

# Debug tests step by step
npm run test:debug

# View test report
npm run test:report

# Run brand neutrality tests only
npm run test:brand-neutrality

# Run all tests (brand neutrality + Playwright)
npm run test:all
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test home-page.spec.ts

# Run specific test by name
npx playwright test --grep "should load home page"

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The tests are configured via `playwright.config.ts` in the root directory with the following features:

### Multi-Browser Support
- **Chromium** (Google Chrome/Microsoft Edge)
- **Firefox** 
- **WebKit** (Safari)
- **Mobile browsers** (Mobile Chrome, Mobile Safari)

### Auto-Waiting Mechanisms
- Automatic waiting for elements to be visible/actionable
- Network idle waiting for page loads
- Custom timeout configurations
- Smart retry mechanisms

### Parallel Execution
- Tests run in parallel for faster execution
- Configurable worker count
- Browser-specific parallel execution

### CI/CD Integration
- **Headless mode** for CI environments
- **Screenshots on failure** automatically captured
- **Video recording** for failed tests
- **Test reports** in multiple formats (HTML, JSON, JUnit)

## Page Object Model

The test suite uses the Page Object Model (POM) pattern for maintainable and reusable code:

### BasePage
Common functionality shared across all pages:
- Navigation methods
- Element interaction helpers
- Screenshot utilities
- Waiting mechanisms

### HomePage
Specific to the main landing page (`index.html`):
- Video interaction testing
- Performance metrics validation
- Responsive design verification
- Strategic analysis module testing

### FitOutLabPage
Specific to the FitOutLab page (`ind2x.html`):
- Section content validation
- Domain and module information testing
- Semantic HTML structure verification

## Test Categories

### Functional Tests
- Page loading and content verification
- User interaction testing
- JavaScript functionality validation
- Form handling (if applicable)

### Cross-Browser Tests
- Browser compatibility verification
- Feature detection and graceful degradation
- Performance consistency across browsers
- Mobile responsiveness

### Performance Tests
- Page load time measurement
- Resource loading optimization
- Network condition simulation
- Memory usage monitoring

### Accessibility Tests
- Semantic HTML structure
- Alt text verification
- Keyboard navigation
- Screen reader compatibility

## Hooks and Fixtures

### Global Setup/Teardown
- `global-setup.ts`: Runs once before all tests
- `global-teardown.ts`: Runs once after all tests
- Used for environment preparation and cleanup

### Test Fixtures
- Page object fixtures for dependency injection
- Consistent test data setup
- Automatic cleanup after each test

### BeforeEach/AfterEach Hooks
- Page navigation setup
- State reset between tests
- Screenshot capture on failure

## Best Practices

### Test Writing
1. Use descriptive test names that explain the expected behavior
2. Keep tests focused on single functionality
3. Use Page Object Model for element interactions
4. Avoid hard-coded waits; use auto-waiting mechanisms
5. Group related tests using `test.describe()`

### Element Selection
1. Prefer semantic selectors (role, label, text)
2. Use data-testid attributes for test-specific elements
3. Avoid brittle CSS selectors that may change
4. Use Playwright's built-in locator strategies

### Assertions
1. Use specific assertions that clearly indicate what is being tested
2. Provide meaningful error messages
3. Test both positive and negative scenarios
4. Verify visual and functional aspects

## Debugging

### Local Debugging
```bash
# Run tests in debug mode
npm run test:debug

# Run with browser visible
npm run test:headed

# Use Playwright UI for interactive debugging
npm run test:ui
```

### CI/CD Debugging
- Check uploaded artifacts for screenshots and videos
- Review test reports for detailed failure information
- Use browser console logs captured during test execution

## Maintenance

### Regular Updates
1. Keep Playwright version updated
2. Update browser versions regularly
3. Review and update test selectors as UI changes
4. Monitor test performance and optimize slow tests

### Adding New Tests
1. Follow existing naming conventions (`*.spec.ts`)
2. Use appropriate page objects
3. Add tests to relevant test suites
4. Update documentation as needed

## Troubleshooting

### Common Issues
1. **Browser not installed**: Run `npm run install:browsers`
2. **Port conflicts**: Ensure port 3000 is available for dev server
3. **Network timeouts**: Check network configuration and timeouts
4. **Element not found**: Verify selectors and page loading

### Performance Issues
1. **Slow tests**: Check network conditions and increase timeouts
2. **Memory issues**: Reduce parallel workers or optimize test data
3. **CI timeouts**: Increase job timeout in workflow configuration

For more detailed information, refer to the [Playwright documentation](https://playwright.dev/docs/intro).