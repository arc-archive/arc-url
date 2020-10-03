/* eslint-disable no-template-curly-in-string */
import { fixture, html, assert, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { RequestEventTypes, RequestEvents, TelemetryEventTypes } from '@advanced-rest-client/arc-events';
import { ArcModelEventTypes } from '@advanced-rest-client/arc-models';
import { UrlParser } from '../index.js';
import '../url-input-editor.js';
import {
  dispatchAnalyticsEvent,
  decodeEncode,
  processUrlParams,
  readAutocomplete,
  autocompleteRef,
} from '../src/internals.js';

/** @typedef {import('../index').UrlInputEditorElement} UrlInputEditorElement */
/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput */
/** @typedef {import('@anypoint-web-components/anypoint-button').AnypointButton} AnypointButton */

describe('UrlInputEditorElement', () => {
  /**
   * @return {Promise<UrlInputEditorElement>}
   */
  async function basicFixture() {
    return fixture(html`<url-input-editor></url-input-editor>`);
  }
  /**
   * @return {Promise<UrlInputEditorElement>}
   */
  async function readonlyFixture() {
    return fixture(html`<url-input-editor readOnly></url-input-editor>`);
  }
  /**
   * @return {Promise<UrlInputEditorElement>}
   */
  async function detailsFixture() {
    return fixture(html`<url-input-editor detailsopened></url-input-editor>`);
  }
  /**
   * @return {Promise<UrlInputEditorElement>}
   */
  async function valueFixture(value) {
    return fixture(html`<url-input-editor .value="${value}"></url-input-editor>`);
  }

  describe('Basic tests', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Adds protocol on input focus', async () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.main-input'));
      const compare = 'http://';
      input.focus();
      assert.equal(input.value, compare);
    });

    it(`dispatches ${RequestEventTypes.State.urlChange} event`, async () => {
      const value = 'https://mulesoft.com/';
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.main-input'));
      input.value = value;
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.State.urlChange, spy);
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(spy.args[0][0].changedProperty, 'url');
      assert.equal(spy.args[0][0].changedValue, value);
    });

    it('encodes URL', async () => {
      const url = 'http://192.168.2.252/service/board/1/edit?description=We\'ll keep your precious' +
        ' pup fed, watered, walked and socialized during their stay.';
      const comp = 'http://192.168.2.252/service/board/1/edit?description=We\'ll+keep+your+' +
        'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
      element.value = url;
      element.encodeParameters();
      assert.equal(element.value, comp);
    });

    it('decodes URL', async () => {
      const comp = 'http://192.168.2.252/service/board/1/edit?description=We\'ll keep your precious' +
        ' pup fed, watered, walked and socialized during their stay.';
      const url = 'http://192.168.2.252/service/board/1/edit?description=We%27ll+keep+your+' +
        'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
      element.value = url;
      element.decodeParameters();
      assert.equal(element.value, comp);
    });

    it('opens detailed editor', async () => {
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('.toggle-icon'));
      button.click();
      assert.isTrue(element.detailsOpened);
    });
  });

  describe('Read only mode', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await readonlyFixture();
    });

    it('ignores input focus', async () => {
      element.value = '';
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.main-input'));
      const compare = 'http://';
      input.focus();
      assert.notEqual(input.value, compare);
    });

    it(`skips ${RequestEventTypes.State.urlChange} event`, () => {
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.State.urlChange, spy);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.main-input'));
      input.value = 'https://mulesoft.com/';
      input.dispatchEvent(new CustomEvent('input'));
      assert.isFalse(spy.called);
    });

    it('Does not encode URL', () => {
      const url = 'http://192.168.2.252/service/board/1/edit?description=We\'ll keep your precious' +
        ' pup fed, watered, walked and socialized during their stay.';
      element.value = url;
      element.encodeParameters();
      assert.equal(element.value, url);
    });

    it('Does not encode URL', () => {
      const url = 'http://192.168.2.252/service/board/1/edit?description=We%27ll+keep+your+' +
    'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
      element.value = url;
      element.decodeParameters();
      assert.equal(element.value, url);
    });
  });

  describe('Validation', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Empty value does not passes validation', async () => {
      element.value = '';
      await nextFrame();
      const result = element.validate('');
      assert.isFalse(result);
    });

    it('Passes validation with value', () => {
      element.value = 'test';
      const result = element.validate('test');
      assert.isTrue(result);
    });
  });

  describe('[extValueChangeHandler]()', () => {
    const newValue = 'https://test-value';

    it('ignores events dispatched by self', async () => {
      const element = await basicFixture();
      RequestEvents.State.urlChange(element, newValue);
      assert.notEqual(element.value, newValue);
    });

    it('ignores the event when readonly', async () => {
      const element = await readonlyFixture();
      RequestEvents.State.urlChange(document.body, newValue);
      assert.notEqual(element.value, newValue);
    });

    it('sets the new value', async () => {
      const element = await basicFixture();
      RequestEvents.State.urlChange(window, newValue);
      assert.equal(element.value, newValue);
    });

    it('does nothing when value is already set', async () => {
      const element = await basicFixture();
      element.value = newValue;
      RequestEvents.State.urlChange(window, newValue);
      assert.equal(element.value, newValue);
    });

    it('change event is not dispatched', async () => {
      const element = await basicFixture();
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.State.urlChange, spy);
      RequestEvents.State.urlChange(window, newValue);
      assert.isFalse(spy.called);
    });
  });

  describe('toggle()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('toggles detailsOpened', () => {
      element.toggle();
      assert.isTrue(element.detailsOpened);
    });

    it('toggles back detailsOpened', () => {
      element.detailsOpened = true;
      element.toggle();
      assert.isFalse(element.detailsOpened);
    });

    it('parameters overlay is opened', async () => {
      element.toggle();
      await nextFrame();
      const node = element.shadowRoot.querySelector('url-params-editor');
      assert.isTrue(node.opened);
    });

    it('parameters overlay is closed by default', () => {
      const node = element.shadowRoot.querySelector('url-params-editor');
      assert.isFalse(node.opened);
    });

    it('dispatches detailsopened event', () => {
      const spy = sinon.spy();
      element.addEventListener('detailsopened', spy);
      element.toggle();
      assert.isTrue(spy.called, 'event is dispatched');
    });
  });

  describe('[dispatchAnalyticsEvent]()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    const label = 'test-label';
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches the event', () => {
      const spy = sinon.spy();
      element.addEventListener(TelemetryEventTypes.event, spy);
      element[dispatchAnalyticsEvent](label);
      assert.isTrue(spy.called);
    });

    it('sets the category', () => {
      const spy = sinon.spy();
      element.addEventListener(TelemetryEventTypes.event, spy);
      element[dispatchAnalyticsEvent](label);
      assert.equal(spy.args[0][0].detail.category, 'Request view');
    });

    it('sets the action', () => {
      const spy = sinon.spy();
      element.addEventListener(TelemetryEventTypes.event, spy);
      element[dispatchAnalyticsEvent](label);
      assert.equal(spy.args[0][0].detail.action, 'URL editor');
    });

    it('sets the label', () => {
      const spy = sinon.spy();
      element.addEventListener(TelemetryEventTypes.event, spy);
      element[dispatchAnalyticsEvent](label);
      assert.equal(spy.args[0][0].detail.label, label);
    });
  });

  describe('encodeParameters()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls [decodeEncode] with "encode" argument', () => {
      const spy = sinon.spy(element, decodeEncode);
      element.encodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'encode');
    });

    it('calls [dispatchAnalyticsEvent] with label', () => {
      const spy = sinon.spy(element, dispatchAnalyticsEvent);
      element.encodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Encode parameters');
    });

    it('does nothing when read only mode', () => {
      element.readOnly = true;
      const spy = sinon.spy(element, decodeEncode);
      element.encodeParameters();
      assert.isFalse(spy.called);
    });
  });

  describe('decodeParameters()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls [decodeEncode] with "decode" argument', () => {
      const spy = sinon.spy(element, decodeEncode);
      element.decodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'decode');
    });

    it('calls [dispatchAnalyticsEvent] with label', () => {
      const spy = sinon.spy(element, dispatchAnalyticsEvent);
      element.decodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Decode parameters');
    });

    it('does nothing when read only mode', () => {
      element.readOnly = true;
      const spy = sinon.spy(element, decodeEncode);
      element.decodeParameters();
      assert.isFalse(spy.called);
    });
  });

  describe('[decodeEncode]()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    const encodedUrl = 'http://192.168.2.252/service/board%201/edit?description=We\'ll+keep+your+' +
    'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
    const decodedUrl = 'http://192.168.2.252/service/board 1/edit?description=We\'ll keep your precious' +
      ' pup fed, watered, walked and socialized during their stay.';

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls "[processUrlParams]()" with parser instance and decode function', () => {
      element.value = encodedUrl;
      const spy = sinon.spy(element, processUrlParams);
      element[decodeEncode]('decode');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].constructor.name, 'UrlParser');
      assert.equal(spy.args[0][1], 'decode');
    });

    it('sets decoded value', () => {
      element.value = encodedUrl;
      element[decodeEncode]('decode');
      assert.equal(element.value, decodedUrl);
    });

    it('calls "[processUrlParams]()" with parser instance and encode function', () => {
      element.value = decodedUrl;
      const spy = sinon.spy(element, processUrlParams);
      element[decodeEncode]('encode');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].constructor.name, 'UrlParser');
      assert.equal(spy.args[0][1], 'encode');
    });

    it('sets decoded value', () => {
      element.value = decodedUrl;
      element[decodeEncode]('encode');
      assert.equal(element.value, encodedUrl);
    });

    it('does nothing when no value', () => {
      element.value = '';
      const spy = sinon.spy(element, processUrlParams);
      element[decodeEncode]('encode');
      assert.isFalse(spy.called);
    });
  });

  describe('[processUrlParams]() - decoding', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    const encodedUrl = 'http://192.168.2.252/service/board%201/edit?desc+ription=We\'ll+keep+your+' +
    'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
    const fnName = 'decode';
    let parser;

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('decodes query parameters', () => {
      parser = new UrlParser(encodedUrl);
      element[processUrlParams](parser, fnName);
      const param = parser.searchParams[0];
      assert.equal(param[0], 'desc ription');
      assert.equal(param[1], 'We\'ll keep your precious pup fed, watered, walked and socialized during their stay.');
    });

    it('decodes the path', () => {
      parser = new UrlParser(encodedUrl);
      element[processUrlParams](parser, fnName);
      assert.equal(parser.path, '/service/board 1/edit');
    });

    it('ignores path when not set', () => {
      parser = new UrlParser('?a=b');
      element[processUrlParams](parser, fnName);
      // No error
    });
  });

  describe('[processUrlParams]() - decoding', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    const encodedUrl = 'http://192.168.2.252/service/board 1/edit?desc ription=We\'ll keep your ' +
    'precious pup fed, watered, walked and socialized during their stay.';
    const fnName = 'encode';
    let parser;

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('decodes query parameters', () => {
      parser = new UrlParser(encodedUrl);
      element[processUrlParams](parser, fnName);
      const param = parser.searchParams[0];
      assert.equal(param[0], 'desc+ription');
      assert.equal(param[1],
        'We\'ll+keep+your+precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.');
    });

    it('decodes path', () => {
      parser = new UrlParser(encodedUrl);
      element[processUrlParams](parser, fnName);
      assert.equal(parser.path, '/service/board%201/edit');
    });

    it('ignores path when not set', () => {
      parser = new UrlParser('?a=b');
      element[processUrlParams](parser, fnName);
      // No error
    });
  });

  describe('[readAutocomplete]()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    const query = 'http://';

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches the query event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlHistory.query, spy);
      element[readAutocomplete](query);
      assert.isTrue(spy.called);
    });

    it('sets suggestions when available', async () => {
      element.addEventListener(ArcModelEventTypes.UrlHistory.query, (e) => {
        // @ts-ignore
        e.detail.result = Promise.resolve([{ url: 'test' }]);
      });
      element[readAutocomplete](query);
      await aTimeout(0);
      assert.deepEqual(element[autocompleteRef].source, ['test']);
    });

    it('sets empty when no results', async () => {
      element.addEventListener(ArcModelEventTypes.UrlHistory.query, (e) => {
        // @ts-ignore
        e.detail.result = Promise.resolve();
      });
      element[readAutocomplete](query);
      await aTimeout(0);
      assert.deepEqual(element[autocompleteRef].source, []);
    });

    it('sets empty when error', async () => {
      element.addEventListener(ArcModelEventTypes.UrlHistory.query, (e) => {
        // @ts-ignore
        e.detail.result = Promise.reject(new Error('test'));
      });
      element[readAutocomplete](query);
      await aTimeout(0);
      assert.deepEqual(element[autocompleteRef].source, []);
    });
  });

  describe('[autocompleteQuery]()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('cancels the event', () => {
      const e = new CustomEvent('query', {
        cancelable: true,
        bubbles: true,
        composed: true,
        detail: { value: 'test' }
      });
      const target = element.shadowRoot.querySelector('anypoint-autocomplete');
      target.dispatchEvent(e);
      assert.isTrue(e.defaultPrevented);
    });

    it('stops event propagation', () => {
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      const e = new CustomEvent('query', {
        cancelable: true,
        bubbles: true,
        composed: true,
        detail: { value: 'test' }
      });
      const target = element.shadowRoot.querySelector('anypoint-autocomplete');
      target.dispatchEvent(e);
      assert.isFalse(spy.called);
    });

    it('calls [readAutocomplete]', async () => {
      const spy = sinon.spy(element, readAutocomplete);
      const e = new CustomEvent('query', {
        cancelable: true,
        bubbles: true,
        composed: true,
        detail: { value: 'test' }
      });
      const target = element.shadowRoot.querySelector('anypoint-autocomplete');
      target.dispatchEvent(e);
      await nextFrame();
      assert.isTrue(spy.called)
    });
  });

  describe('[keyDownHandler]()', () => {
    let element = /** @type UrlInputEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('does nothing when target is not an input', () => {
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.send, spy);
      const div = element.shadowRoot.querySelector('.content-shadow');
      const e = new KeyboardEvent('keydown', {
        code: 'Enter',
        bubbles: true,
        cancelable: true,
        composed: true,
        key: 'Enter',
      });
      div.dispatchEvent(e);
      assert.isFalse(spy.called);
    });

    it('dispatches the send event for the Enter key', () => {
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.send, spy);
      const input = element.shadowRoot.querySelector('.main-input');
      const e = new KeyboardEvent('keydown', {
        code: 'Enter',
        bubbles: true,
        cancelable: true,
        composed: true,
        key: 'Enter',
      });
      input.dispatchEvent(e);
      assert.isTrue(spy.called);
    });

    it('dispatches the send event for the NumpadEnter key', () => {
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.send, spy);
      const input = element.shadowRoot.querySelector('.main-input');
      const e = new KeyboardEvent('keydown', {
        code: 'NumpadEnter',
        bubbles: true,
        cancelable: true,
        composed: true,
        key: 'NumpadEnter',
      });
      input.dispatchEvent(e);
      assert.isTrue(spy.called);
    });
  });

  describe('_getValidity()', () => {
    it('calls validate on detailed editor', async () => {
      const element = await detailsFixture();
      const node = element.shadowRoot.querySelector('url-params-editor');
      const spy = sinon.spy(node, 'validate');
      element._getValidity();
      assert.isTrue(spy.called);
    });

    it('validates the main input', async () => {
      const element = await basicFixture();
      element.value = '';
      await nextFrame();
      const result = element._getValidity();
      assert.isFalse(result);
    });

    it('validates the input when valid', async () => {
      const element = await basicFixture();
      element.value = 'https://api.com';
      await nextFrame();
      const result = element._getValidity();
      assert.isTrue(result);
    });
  });

  describe('a11y', () => {
    it('is accessible', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible with details', async () => {
      const element = await detailsFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});