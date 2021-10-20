# Deprecated

This component is deprecated. Use `@advanced-rest-client/app` instead.

----

A module with logic an UI regions to support URL processing in Advanced REST Client application. It contains a logic to safely parse url with variables, build a URL input, or to enter any arbitrary URL with autosuggestions.

[![Build Status](https://travis-ci.com/advanced-rest-client/arc-url.svg)](https://travis-ci.com/advanced-rest-client/arc-url)

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/arc-url
```

### UrlParser class

A URL parsing library for Advanced REST Client.

It provides an interface similar to the URL class but it is more relax in terms of input validity. It means that it won't throw an error when the URL is invalid. This allows to use the library in request editors.

#### Example

```javascript
import { UrlParser } from '@advanced-rest-client/arc-url';
const parser = new UrlParser('https:///path-with-missing-host?qury=value#string');
console.log(parser.protocol);
console.log(parser.host);
console.log(parser.path);
console.log(parser.searchParams);
console.log(parser.anchor);
```

### web-url-input

An element to render a dialog to enter an URL with auto hints.

#### Examples

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/arc-url/web-url-input.js';
      import '@advanced-rest-client/arc-models/url-history-model.js';
    </script>
  </head>
  <body>
    <url-history-model></url-history-model>
    <web-url-input></web-url-input>
  </body>
</html>
```

```javascript
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/arc-url/web-url-input.js';
import '@advanced-rest-client/arc-models/url-history-model.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <url-history-model></url-history-model>
    <web-url-input @open="${this.openHandler}"></web-url-input>
    `;
  }

  openHandler(e) {
    console.log(e.target.value);
  }
}
customElements.define('sample-element', SampleElement);
```

### url-input-editor

A HTTP request URL editor for a HTTP request editor.

#### URL editor example

```javascript
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/arc-url/url-input-editor.js';
import '@advanced-rest-client/arc-models/url-history-model.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <url-history-model></url-history-model>
    <url-input-editor
      .value="${this.url}"
      @change="${this.valueChanged}"
    ></url-input-editor>
    `;
  }

  valueChanged(e) {
    this.url = e.target.value;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/arc-url
cd arc-url
npm install
```

### Running the tests

```sh
npm test
```
