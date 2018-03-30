const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['../specs/getUsersPosts-spec.js'],
  jasmineNodeOpts: {
    showColors: true,
    includeStackTrace: true,
    isVerbose: true,
    defaultTimeoutInterval: 600000
  },
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--disable-gpu', '--window-size=800,600']
    },
  },
  onPrepare
};

function onPrepare() {
  browser.ignoreSynchronization = true;
  browser.driver.ignoreSynchronization = true;
  browser.manage().window().setSize(1920, 1080);
  global.waitElementVisible = waitElementVisible;
  configChai();
  jasmine.getEnv().addReporter(new SpecReporter({
    spec: {
      displayStacktrace: true
    }
  }));
}

function configChai() {
  chai.use(chaiAsPromised);
  global.chai = chai;
  global.should = chai.should();
  global.assert = chai.assert;
  global.expect = chai.expect;

  Object.defineProperty(
    protractor.promise.Promise.prototype,
    'should',
    Object.getOwnPropertyDescriptor(Object.prototype, 'should')
  );
}

function waitElementVisible(target) {
  const EC = protractor.ExpectedConditions;
  const elementTarget = getElement(target);
  return browser.wait(EC.visibilityOf(elementTarget), 5000).then(() => elementTarget);
}

function getElement(target) {
  if (target.using) {
    return element(target);
  }

  if (typeof target === 'string') {
    return $(target);
  }

  return target;
}
