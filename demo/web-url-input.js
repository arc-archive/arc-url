import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-models/url-history-model.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import { ImportEvents, ArcNavigationEventTypes, ArcModelEvents } from '@advanced-rest-client/arc-events';
import '../web-url-input.js';

/** @typedef {import('@advanced-rest-client/arc-events').ARCExternalNavigationEvent} ARCExternalNavigationEvent */

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties(['opened']);
    this.componentName = 'web-url-input';
    this.compatibility = false;
    this.opened = false;
    this.generator = new DataGenerator();

    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.openHandler = this.openHandler.bind(this);
    this.closedHandler = this.closedHandler.bind(this);
    window.addEventListener(ArcNavigationEventTypes.navigateExternal, this.navigateExternalHandler.bind(this));
  }

  async generateData() {
    await this.generator.insertUrlHistoryData({
      size: 100,
    });
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.generator.destroyUrlData();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  openHandler() {
    this.opened = true;
  }

  closedHandler() {
    this.opened = false;
  }

  /**
   * @param {ARCExternalNavigationEvent} e 
   */
  navigateExternalHandler(e) {
    console.log('Open external', e.url, e.detail);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      opened,
    } = this;
    
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the request meta details element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <anypoint-button ?compatibility="${compatibility}" @click="${this.openHandler}" slot="content">Open</anypoint-button>
        </arc-interactive-demo>
        <web-url-input 
          .opened="${opened}" 
          @closed="${this.closedHandler}"
          purpose="demo-page"
        ></web-url-input>
      </section>
    `;
  }

  _dataControlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>ARC web URL input</h2>
      <url-history-model></url-history-model>
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
