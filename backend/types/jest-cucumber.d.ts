declare module 'jest-cucumber' {
  export interface StepDefinitions {
    given: (stepMatcher: string | RegExp, stepDefinitionFunction: (...args: any[]) => void) => void;
    when: (stepMatcher: string | RegExp, stepDefinitionFunction: (...args: any[]) => void) => void;
    then: (stepMatcher: string | RegExp, stepDefinitionFunction: (...args: any[]) => void) => void;
    and: (stepMatcher: string | RegExp, stepDefinitionFunction: (...args: any[]) => void) => void;
    but: (stepMatcher: string | RegExp, stepDefinitionFunction: (...args: any[]) => void) => void;
  }

  export interface TestFunction {
    (testName: string, testFunction: (stepDefinitions: StepDefinitions) => void): void;
  }

  export function defineFeature(
    feature: any,
    defineFeatureFunction: (test: TestFunction) => void
  ): void;

  export function loadFeature(featureFilePath: string): any;
}
