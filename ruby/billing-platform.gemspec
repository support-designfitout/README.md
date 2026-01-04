# frozen_string_literal: true

require_relative "lib/billing-platform/version"

Gem::Specification.new do |spec|
  spec.name = BillingPlatform::LIBRARY_NAME
  spec.version = BillingPlatform::VERSION
  spec.authors = ["Designfitout Team"]
  spec.email = ["support@designfitout.com"]

  spec.summary = BillingPlatform::DESCRIPTION
  spec.description = "Ruby client library for integrating with the Designfitout billing platform. " \
                     "Provides cloud-agnostic billing calculations and payment processing capabilities."
  spec.homepage = BillingPlatform::HOMEPAGE
  spec.license = BillingPlatform::LICENSE
  spec.required_ruby_version = ">= #{BillingPlatform::MINIMUM_RUBY_VERSION}"

  spec.metadata["allowed_push_host"] = "https://rubygems.org"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "#{spec.homepage}/tree/main/ruby"
  spec.metadata["changelog_uri"] = "#{spec.homepage}/blob/main/CHANGELOG.md"
  spec.metadata["bug_tracker_uri"] = "#{spec.homepage}/issues"
  spec.metadata["documentation_uri"] = "https://www.rubydoc.info/gems/billing-platform"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features)/|\.(?:git|travis|circleci)|appveyor)})
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  # Runtime dependencies
  spec.add_dependency "faraday", "~> 2.7"
  spec.add_dependency "faraday-retry", "~> 2.2"
  spec.add_dependency "json", "~> 2.6"

  # Development dependencies
  spec.add_development_dependency "bundler", "~> 2.4"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.12"

  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html
end