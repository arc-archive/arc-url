/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import {classMap} from 'lit-html/directives/class-map.js';
import {styleMap} from 'lit-html/directives/style-map.js';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-autocomplete/anypoint-autocomplete.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import { TelemetryEvents, RequestEvents, RequestEventTypes, ArcModelEvents } from '@advanced-rest-client/arc-events';
import classStyles from './styles/UrlInputEditor.styles.js';
import { UrlParser } from './UrlParser.js';
import '../url-params-editor.js';
import { encodeQueryString, decodeQueryString, cancelEvent } from './Utils.js';
import { 
  autocompleteRef, 
  readAutocomplete,
  focusedValue,
  overlayOpenedValue,
  suggestionsOpenedHandler,
  shadowContainerOpened,
  shadowContainerHeight,
  paramsEditorTemplate,
  mainInputTemplate,
  shadowTemplate,
  urlAutocompleteTemplate,
  paramsResizeHandler,
  paramsClosedHandler,
  paramsOpenedHandler,
  inputHandler,
  toggleHandler,
  valueValue,
  notifyChange,
  extValueChangeHandler,
  keyDownHandler,
  decodeEncode,
  dispatchAnalyticsEvent,
  processUrlParams,
  autocompleteQuery,
  autocompleteResizeHandler,
  setShadowHeight,
  mainFocusBlurHandler,
  autocompleteOpened,
} from './internals.js';

/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */

/** @typedef {import('@anypoint-web-components/anypoint-autocomplete').AnypointAutocomplete} AnypointAutocomplete */
/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput */
/** @typedef {import('@advanced-rest-client/arc-events').RequestChangeEvent} RequestChangeEvent */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('./UrlParamsEditorElement').UrlParamsEditorElement} UrlParamsEditorElement */

/**
 * The request URL editor
 *
 * The element renders an editor for a HTTP request editor.
 */
export class UrlInputEditorElement extends EventsTargetMixin(ValidatableMixin(LitElement)) {
  static get styles() {
    return classStyles;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**  
       * The current URL value.
       */
      value: { type: String },
      /**
       * True if detailed editor is opened.
       */
      detailsOpened: { type: Boolean },
      /**
       * Default protocol for the URL if it's missing.
       */
      defaultProtocol: { type: String },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
    };
  }

  get value() {
    return this[valueValue];
  }

  set value(value) {
    const old = this[valueValue];
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    this.requestUpdate('value', old);
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * @return {AnypointAutocomplete}
   */
  get [autocompleteRef]() {
    return this.shadowRoot.querySelector('anypoint-autocomplete');
  }

  /**
   * @returns {any} An icon name for the main input suffix icon
   */
  get inputIcon() {
    const { detailsOpened } = this;
    return detailsOpened ? 'close' : 'edit';
  }

  /**
   * @returns {string} A title for the main input suffix icon
   */
  get inputIconTitle() {
    const { detailsOpened } = this;
    return detailsOpened ? 'Close parameters editor' : 'Open parameters editor';
  }

  constructor() {
    super();
    this[extValueChangeHandler] = this[extValueChangeHandler].bind(this);
    this[keyDownHandler] = this[keyDownHandler].bind(this);
    this.defaultProtocol = 'http';
    this.value = 'http://';

    this.compatibility = false;
    this.readOnly = false;
    this.outlined = false;
    this[autocompleteOpened] = false;
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    node.addEventListener(RequestEventTypes.State.urlChange, this[extValueChangeHandler]);
    this.addEventListener('keydown', this[keyDownHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    node.removeEventListener(RequestEventTypes.State.urlChange, this[extValueChangeHandler]);
    this.removeEventListener('keydown', this[keyDownHandler]);
  }

  /**
   * A handler that is called on input
   */
  [notifyChange]() {
    RequestEvents.State.urlChange(this, this.value);
  }

  /**
   * A handler for the `url-value-changed` event.
   * If this element is not the source of the event then it will update the `value` property.
   * It's to be used besides the Polymer's data binding system.
   *
   * @param {RequestChangeEvent} e
   */
  [extValueChangeHandler](e) {
    if (e.composedPath()[0] === this || this.readOnly) {
      return;
    }
    const { changedProperty, changedValue } = e;
    if (changedProperty === 'url' && changedValue !== this.value) {
      this.value = changedValue;
    }
  }

  /**
   * Opens detailed view.
   */
  toggle() {
    this.detailsOpened = !this.detailsOpened;
    this.dispatchEvent(new CustomEvent('detailsopened'));
  }

  /**
   * HTTP encode query parameters
   */
  encodeParameters() {
    if (this.readOnly) {
      return;
    }
    this[decodeEncode]('encode');
    this[dispatchAnalyticsEvent]('Encode parameters');
  }

  /**
   * HTTP decode query parameters
   */
  decodeParameters() {
    if (this.readOnly) {
      return;
    }
    this[decodeEncode]('decode');
    this[dispatchAnalyticsEvent]('Decode parameters');
  }

  /**
   * Dispatches analytics event with "event" type.
   * @param {String} label A label to use with GA event
   */
  [dispatchAnalyticsEvent](label) {
    const init = {
      category: 'Request view',
      action: 'URL editor',
      label,
    }
    TelemetryEvents.event(this, init);
  }

  /**
   * HTTP encode or decode query parameters depending on [type].
   *
   * @param {string} type
   */
  [decodeEncode](type) {
    const url = this.value;
    if (!url) {
      return;
    }
    const parser = new UrlParser(url);
    this[processUrlParams](parser, type);
    this.value = parser.value;
    this[notifyChange]();
  }


  /**
   * Processes query parameters and path value by `processFn`.
   * The function has to be available on this instance.
   * @param {UrlParser} parser Instance of UrlParser
   * @param {string} processFn Function name to call on each parameter
   */
  [processUrlParams](parser, processFn) {
    const decoded = parser.searchParams.map((item) => {
      let key;
      let value;
      if (processFn === 'encode') {
        key = encodeQueryString(item[0], true);
        value = encodeQueryString(item[1], true);
      } else {
        key = decodeQueryString(item[0], true);
        value = decodeQueryString(item[1], true);
      }
      return [key, value];
    });
    parser.searchParams = decoded;
    const { path } = parser;
    if (path && path.length) {
      const parts = path.split('/');
      let tmp = '/';
      for (let i = 0, len = parts.length; i < len; i++) {
        let part = parts[i];
        if (!part) {
          continue;
        }
        if (processFn === 'encode') {
          part = encodeQueryString(part, false);
        } else {
          part = decodeQueryString(part, false);
        }
        tmp += part;
        if (i + 1 !== len) {
          tmp += '/';
        }
      }
      parser.path = tmp;
    }
  }

  /**
   * Handler for autocomplete element query event.
   * Dispatches `url-history-query` to query history model for data.
   * @param {CustomEvent} e
   * @return {Promise<void>}
   */
  async [autocompleteQuery](e) {
    e.preventDefault();
    e.stopPropagation();
    const { value } = e.detail;
    await this[readAutocomplete](value);
  }

  /**
   * Queries the data model for history data and sets the suggestions
   * @param {string} q User query from the input field
   * @return {Promise<void>}
   */
  async [readAutocomplete](q) {
    try {
      const result = await ArcModelEvents.UrlHistory.query(this, q);
      const suggestions = (result || []).map((item) => item.url);
      this[autocompleteRef].source = suggestions;
    } catch (e) {
      this[autocompleteRef].source = [];
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keyDownHandler](e) {
    const target = /** @type HTMLElement */ (e.composedPath()[0]);
    if (!target || target.nodeName !== 'INPUT') {
      return;
    }
    if (['Enter', 'NumpadEnter'].includes(e.code)) {
      RequestEvents.send(this);
    }
  }

  /**
   * Validates the element.
   * @return {boolean}
   */
  _getValidity() {
    if (this.detailsOpened) {
      const element = /** @type UrlParamsEditorElement */ (this.shadowRoot.querySelector('url-params-editor'));
      return element.validate(this.value);
    }
    const element = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('.main-input'));
    return element.validity.valid;
  }

  /**
   * @param {Event} e A handler for either main input or the details editor value change
   */
  [inputHandler](e) {
    if (this.readOnly) {
      return;
    }
    const node = /** @type HTMLInputElement */ (e.target);
    this.value = node.value;
    this[notifyChange]();
  }

  /**
   * @param {PointerEvent} e
   */
  [toggleHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.toggle();
  }

  /**
   * @param {Event} e
   */
  [mainFocusBlurHandler](e) {
    this[focusedValue] = e.type === 'focus';
    this.requestUpdate();
  }

  /**
   * @param {CustomEvent} e
   */
  [suggestionsOpenedHandler](e) {
    const node = /** @type AnypointAutocomplete */ (e.target);
    const { opened } = node;
    if (this[overlayOpenedValue] !== opened) {
      this[overlayOpenedValue] = opened;
      this[autocompleteOpened] = opened;
      this.requestUpdate();
    }
    if (!opened) {
      this[shadowContainerOpened] = false;
      this[shadowContainerHeight] = 0;
      this.requestUpdate();
    }
  }

  [autocompleteResizeHandler]() {
    if (!this[overlayOpenedValue]) {
      return;
    }
    const ac = this[autocompleteRef].querySelector('anypoint-dropdown');
    const rect = ac.getBoundingClientRect();
    if (!rect.height) {
      return;
    }
    this[setShadowHeight](rect.height);
  }

  /**
   * Sets a height on the shadow background element.
   * @param {number} height
   */
  [setShadowHeight](height) {
    this[shadowContainerHeight] = height;
    this[shadowContainerOpened] = true;
    this.requestUpdate();
  }

  [paramsOpenedHandler](e) {
    cancelEvent(e);
    const rect = e.target.getBoundingClientRect();
    if (!rect.height) {
      return;
    }
    this[overlayOpenedValue] = true;
    this[setShadowHeight](rect.height);
  }

  /**
   * @param {Event} e 
   */
  [paramsClosedHandler](e) {
    cancelEvent(e);
    this[overlayOpenedValue] = false;
    this[shadowContainerOpened] = false;
    this[shadowContainerHeight] = 0;
    this.detailsOpened = false;
    this.requestUpdate();
  }

  /**
   * @param {Event} e 
   */
  async [paramsResizeHandler](e) {
    const node = /** @type UrlParamsEditorElement */ (e.target);
    // the overlay mixin uses "raf" to schedule a task to re-render the
    // overlay after a resize. The height computations has to be done
    // after the overlay is re-rendered.
    requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      if (!rect.height) {
        return;
      }
      this[setShadowHeight](rect.height);
    });
  }

  render() {
    const focused = this[focusedValue];
    const overlay = this[overlayOpenedValue];
    const acOpened = this[autocompleteOpened];
    const classes = {
      container: true,
      focused,
      overlay,
      autocomplete: acOpened,
    };
    return html`
    ${this[shadowTemplate]()}
    <div class="${classMap(classes)}">
      ${this[mainInputTemplate]()}  
      ${this[paramsEditorTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult} A template for the main input element
   */
  [mainInputTemplate]() {
    const { inputIcon, inputIconTitle, value } = this;
    const acOpened = this[autocompleteOpened];
    const iconClasses = {
      'toggle-icon': true,
      disabled: acOpened,
    };
    return html`
    <div class="input-wrapper">
      <input 
        .value="${value}" 
        class="main-input"
        required
        placeholder="Request URL"
        id="mainInput"
        autocomplete="off"
        spellcheck="false"
        @focus="${this[mainFocusBlurHandler]}"
        @blur="${this[mainFocusBlurHandler]}"
        @input="${this[inputHandler]}"
        aria-label="The URL value"
      />
      <arc-icon 
        icon="${inputIcon}"
        title="${inputIconTitle}"
        class="${classMap(iconClasses)}"
        @click="${this[toggleHandler]}"
      ></arc-icon>
    </div>
    ${this[urlAutocompleteTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} A template for the autocomplete element
   */
  [urlAutocompleteTemplate]() {
    const { detailsOpened, compatibility } = this;
    return html`
    <anypoint-autocomplete
      fitPositionTarget
      horizontalAlign="left"
      verticalAlign="top"
      verticalOffset="44"
      ignoreDropdownStyling
      .positionTarget="${this}"
      target="mainInput"
      ?disabled="${detailsOpened}"
      ?compatibility="${compatibility}"
      @query="${this[autocompleteQuery]}"
      @opened-changed="${this[suggestionsOpenedHandler]}"
      @closed="${cancelEvent}"
      @overlay-opened="${cancelEvent}"
      @overlay-closed="${cancelEvent}"
      @iron-overlay-opened="${cancelEvent}"
      @iron-overlay-closed="${cancelEvent}"
      @resize="${this[autocompleteResizeHandler]}"
    ></anypoint-autocomplete>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the background shadow below
   * the main input and the overlays
   */
  [shadowTemplate]() {
    const opened = this[shadowContainerOpened];
    const styles = { height: `0px` };
    if (this[shadowContainerHeight] !== undefined) {
      styles.height = `${this[shadowContainerHeight] + 40}px`
    }
    const classes = {
      'content-shadow': true,
      opened,
    };
    return html`
    <div class="${classMap(classes)}" style=${styleMap(styles)}></div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for query parameters overlay
   */
  [paramsEditorTemplate]() {
    const {
      compatibility,
      readOnly,
      outlined,
      detailsOpened,
      value
    } = this;
    return html`
    <url-params-editor
      class="params-editor"
      fitPositionTarget
      horizontalAlign="left"
      verticalAlign="top"
      .positionTarget="${this}"
      noOverlap
      .value="${value}"
      noCancelOnOutsideClick
      @urlencode="${this.encodeParameters}"
      @urldecode="${this.decodeParameters}"
      @change="${this[inputHandler]}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      ?opened="${detailsOpened}"
      @opened="${this[paramsOpenedHandler]}"
      @closed="${this[paramsClosedHandler]}"
      @overlay-closed="${cancelEvent}"
      @overlay-opened="${cancelEvent}"
      @iron-overlay-closed="${cancelEvent}"
      @iron-overlay-opened="${cancelEvent}"
      @resize="${this[paramsResizeHandler]}"
    ></url-params-editor>
    `;
  }
}
