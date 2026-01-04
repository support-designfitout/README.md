# frozen_string_literal: true

module BillingPlatform
  # The version of the Billing Platform Ruby client
  # This follows semantic versioning (https://semver.org/)
  # 
  # Format: MAJOR.MINOR.PATCH
  # - MAJOR: Incompatible API changes
  # - MINOR: Backwards-compatible functionality additions  
  # - PATCH: Backwards-compatible bug fixes
  #
  # Pre-release versions may include additional identifiers:
  # - alpha: Early development version
  # - beta: Feature-complete but potentially unstable
  # - rc: Release candidate, stable but not final
  VERSION = "1.0.0"

  # Version information breakdown
  VERSION_MAJOR = 1
  VERSION_MINOR = 0
  VERSION_PATCH = 0
  VERSION_PRE = nil

  # Build metadata (optional)
  VERSION_BUILD = nil

  # Full version string with optional pre-release and build metadata
  def self.version
    version = "#{VERSION_MAJOR}.#{VERSION_MINOR}.#{VERSION_PATCH}"
    version += "-#{VERSION_PRE}" if VERSION_PRE
    version += "+#{VERSION_BUILD}" if VERSION_BUILD
    version
  end

  # Version compatibility check
  def self.compatible_with?(version_string)
    required = Gem::Version.new(version_string)
    current = Gem::Version.new(VERSION)
    
    # Major version must match for compatibility
    # Minor version must be >= required version
    current.segments[0] == required.segments[0] && current >= required
  rescue ArgumentError
    false
  end

  # Version information as a hash
  def self.version_info
    {
      version: VERSION,
      major: VERSION_MAJOR,
      minor: VERSION_MINOR,
      patch: VERSION_PATCH,
      pre: VERSION_PRE,
      build: VERSION_BUILD,
      full: version
    }
  end

  # Ruby version compatibility
  MINIMUM_RUBY_VERSION = "2.7.0"

  def self.ruby_compatible?
    Gem::Version.new(RUBY_VERSION) >= Gem::Version.new(MINIMUM_RUBY_VERSION)
  end

  # Library information
  LIBRARY_NAME = "billing-platform"
  DESCRIPTION = "Ruby client library for Designfitout billing platform"
  HOMEPAGE = "https://github.com/support-designfitout/Designfitout-Github"
  LICENSE = "MIT"

  # API compatibility version
  # This indicates the API version this client is compatible with
  API_VERSION = "v1"

  def self.user_agent
    "#{LIBRARY_NAME}/#{VERSION} (#{RUBY_PLATFORM}) Ruby/#{RUBY_VERSION}"
  end
end