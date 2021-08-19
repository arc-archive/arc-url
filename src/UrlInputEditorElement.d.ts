import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin';
import { AnypointListbox } from '@anypoint-web-components/anypoint-listbox';
import { UrlHistory } from '@advanced-rest-client/arc-types';
import {UrlParser} from '../';
import { 
  readAutocomplete,
  focusedValue,
  overlayOpenedValue,
  toggleSuggestions,
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
  autocompleteResizeHandler,
  setShadowHeight,
  mainFocusBlurHandler,
  autocompleteOpened,
  suggestionsValue,
  renderedSuggestions,
  suggestionsListTemplate,
  suggestionItemTemplate,
  previousValue,
  filterSuggestions,
  suggestionHandler,
  setSuggestionsWidth,
  autocompleteClosedHandler,
  suggestionsList,
  removeSuggestionHandler,
  clearSuggestionsHandler,
  urlHistoryDeletedHandler,
  urlHistoryDestroyedHandler,
} from './internals.js';
import { ARCHistoryUrlDeletedEvent, ARCModelStateDeleteEvent } from '@advanced-rest-client/arc-events';


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

  /**
   * An icon name for the main input suffix icon
   */
  get inputIcon(): string;
  /**
   * A title for the main input suffix icon
   */
  get inputIconTitle(): string;
  [focusedValue]: boolean;
  [overlayOpenedValue]: boolean;
  [shadowContainerOpened]: boolean;
  [shadowContainerHeight]: number;
  [autocompleteOpened]: boolean;
  get [suggestionsList](): AnypointListbox;
  [suggestionsValue]: UrlHistory.ARCUrlHistory[];
  [renderedSuggestions]: UrlHistory.ARCUrlHistory[];
  [previousValue]: string;

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
   * Queries the data model for history data and sets the suggestions
   *
   * @param q URL query
   */
  [readAutocomplete](q: string): Promise<void>;

  [keyDownHandler](e: KeyboardEvent): void;

  /**
   * Validates the element.
   */
  _getValidity(): boolean;
  [inputHandler](e: CustomEvent): void;
  [toggleHandler](e: PointerEvent): void;
  [mainFocusBlurHandler](e: Event): void;
  /**
   * Triggers URL suggestions rendering.
   * If there are suggestions to render this will enable the dropdown.
   */
  renderSuggestions(): Promise<void>;
  /**
   * Performs the query on the current suggestions and, if any, renders them.
   */
  [filterSuggestions](): Promise<void>;
  [toggleSuggestions](opened: boolean): void;
  [autocompleteResizeHandler](): void;
  [suggestionHandler](): void;
  /**
   * Sets the width of the suggestions container so it renders
   * the URL suggestions in the full width of the input container.
   */
  [setSuggestionsWidth](): void;
  /**
   * A handler for the close event dispatched by the suggestions drop down.
   * Closes the suggestions (sets the state) and cancels the event.
   */
  [autocompleteClosedHandler](e: Event): void;
  [setShadowHeight](height: number): void;
  [paramsOpenedHandler](e: CustomEvent): void;
  [paramsClosedHandler](e: CustomEvent): void;
  [paramsResizeHandler](e: CustomEvent): Promise<void>;
  /**
   * Removes the rendered suggestion from the store and from the currently rendered list.
   */
  [removeSuggestionHandler](e: Event): Promise<void>;

  /**
   * Removes all stored history URLs.
   */
  [clearSuggestionsHandler](e: Event): Promise<void>;

  [urlHistoryDeletedHandler](e: ARCHistoryUrlDeletedEvent): void;

  [urlHistoryDestroyedHandler](e: ARCModelStateDeleteEvent): void;
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
   * @returns The template for the suggestions list.
   */
  [suggestionsListTemplate](): TemplateResult[]|string;
  /**
   * @returns The template for an URL suggestion item.
   */
  [suggestionItemTemplate](item: UrlHistory.ARCUrlHistory): TemplateResult;
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
