const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  	...jestConfig,
	modulePathIgnorePatterns: ["<rootDir>/.localdevserver"],
	moduleNameMapper: {
		"^lightning/modal$": "<rootDir>/force-app/test/jest-mocks/lightning/modal",
		"^lightning/modalHeader$":
		"<rootDir>/force-app/test/jest-mocks/lightning/modalHeader",
		"^lightning/modalBody$":
		"<rootDir>/force-app/test/jest-mocks/lightning/modalBody",
		"^lightning/modalFooter$":
		"<rootDir>/force-app/test/jest-mocks/lightning/modalFooter"
	}
};
