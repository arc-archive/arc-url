import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {UrlParser} from '@advanced-rest-client/url-parser/url-parser.js';
import { AnypointAutocomplete } from '@anypoint-web-components/anypoint-autocomplete';
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
  enterKeyHandler,
  autocompleteResizeHandler,
  setShadowHeight,
  mainFocusBlurHandler,
  autocompleteOpened,
} from './internals.js';

/**
 * The request URL editor
 *
 * The element renders an editor for a HTTP request editor.
 * 
 * @fires change When the editor value change
 */
export declare class UrlInputEditorElement {
  static readonly styles: CSSResult;

  /**
   * Current URL value.
   * @attribute
   */
  value: string;
  [valueValue]: string;

  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined: boolean;

  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;

  /**
   * True if detailed editor is opened.
   * @attribute
   */
  detailsOpened: boolean;

  /**
   * Default protocol for the URL if it's missing.
   * @attribute
   */
  defaultProtocol: string;

  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  
  [autocompleteRef]: AnypointAutocomplete;

  /**
   * An icon name for the main input suffix icon
   */
  readonly inputIcon: string;
  /**
   * A title for the main input suffix icon
   */
  readonly inputIconTitle: string;
  [focusedValue]: boolean;
  [overlayOpenedValue]: boolean;
  [shadowContainerOpened]: boolean;
  [shadowContainerHeight]: number;
  [autocompleteOpened]: boolean;

  constructor();
  
  _attachListeners(node: EventTarget): void;
  _detachListeners(node: EventTarget): void;

  /**
   * A handler that is called on input
   */
  [notifyChange](): void;

  /**
   * A handler for the `url-value-changed` event.
   * If this element is not the source of the event then it will update the `value` property.
   * It's to be used besides the Polymer's data binding system.
   */
  [extValueChangeHandler](e: CustomEvent): void;

  /**
   * Opens detailed view.
   */
  toggle(): void;

  /**
   * HTTP encode query parameters
   */
  encodeParameters(): void;

  /**
   * HTTP decode query parameters
   */
  decodeParameters(): void;

  /**
   * Dispatches analytics event with "event" type.
   *
   * @param label A label to use with GA event
   */
  [dispatchAnalyticsEvent](label: string): void;

  /**
   * HTTP encode or decode query parameters depending on [type].
   */
  [decodeEncode](type: string): void;

  /**
   * Processes query parameters and path value by `processFn`.
   * The function has to be available on this instance.
   *
   * @param parser Instance of UrlParser
   * @param processFn Function name to call on each parameter
   */
  [processUrlParams](parser: UrlParser, processFn: string): void;

  /**
   * Handler for autocomplete element query event.
   * Dispatches `url-history-query` to query history model for data.
   */
  [autocompleteQuery](e: CustomEvent): Promise<void>;

  /**
   * Queries the data model for history data and sets the suggestions
   *
   * @param q URL query
   */
  [readAutocomplete](q: string): Promise<void>;

  [keyDownHandler](e: KeyboardEvent): void;

  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send a `send` event.
   */
  [enterKeyHandler](): void;

  /**
   * Validates the element.
   */
  _getValidity(): boolean;
  [inputHandler](e: CustomEvent): void;
  [toggleHandler](e: PointerEvent): void;
  [mainFocusBlurHandler](e: Event): void;
  [suggestionsOpenedHandler](e: CustomEvent): void;
  [autocompleteResizeHandler](): void;
  [setShadowHeight](height: number): void;
  [paramsOpenedHandler](e: CustomEvent): void;
  [paramsClosedHandler](e: CustomEvent): void;
  [paramsResizeHandler](e: CustomEvent): Promise<void>;
  render(): TemplateResult;
  /**
   * A template for the main input element
   */
  [mainInputTemplate](): TemplateResult;
  /**
   * @returns A template for the autocomplete element
   */
  [urlAutocompleteTemplate](): TemplateResult;
  /**
   * @returns A template for the background shadow below
   * the main input and the overlays
   */
  [shadowTemplate](): TemplateResult;
  /**
   * @returns A template for query parameters overlay
   */
  [paramsEditorTemplate](): TemplateResult;
}
export declare interface UrlInputEditorElement extends ValidatableMixin, EventsTargetMixin, LitElement {
}
