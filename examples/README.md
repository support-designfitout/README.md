# Example Configuration Files

This directory contains example configuration files for different scenarios and environments.

## File Structure

- `config.example.development.json` - Development environment example
- `config.example.staging.json` - Staging environment example  
- `config.example.production.json` - Production environment example
- `config.example.google-cloud.json` - Google Cloud specific configuration
- `config.example.aws.json` - AWS specific configuration
- `config.example.azure.json` - Azure specific configuration

## Usage

1. Copy the appropriate example to `config.json`:
   ```bash
   cp examples/config.example.development.json config.json
   ```

2. Edit the values to match your environment:
   ```bash
   # Replace placeholder values with your actual settings
   sed -i 's/YOUR_ANALYTICS_ID/G-XXXXXXXXXX/' config.json
   ```

3. Validate your configuration:
   ```bash
   node config-manager.js validate
   ```

## Examples

### Development Setup
```bash
cp examples/config.example.development.json config.json
# Edit config.json with your local settings
node config-manager.js validate
```

### Production Deployment
```bash
cp examples/config.example.production.json config.json
# Edit config.json with your production values
node config-manager.js optimize production
```

### Cloud Provider Setup
```bash
# For Google Cloud
cp examples/config.example.google-cloud.json config.json

# For AWS
cp examples/config.example.aws.json config.json

# For Azure
cp examples/config.example.azure.json config.json
```

## Notes

- Never commit `config.json` to version control
- Always use the template file for version-controlled configuration
- Test your configuration with `node test-brand-neutrality.js`
- Use environment variables for sensitive data