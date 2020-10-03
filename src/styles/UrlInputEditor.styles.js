import { css } from 'lit-element';

export default css`
:host {
  display: block;
  position: relative;
}

.container {
  position: relative;
  border: 1px #e5e5e5 solid;
  border-radius: 20px;
  padding: 0 20px;
  box-sizing: content-box;
  transition: border-radius 0.18s ease-in-out, border-color 0.18s ease-in-out;
  z-index: 2;
  background-color: inherit;
  color: inherit;
}

.content-shadow {
  position: absolute;
  z-index: 1;
  left: 0px;
  right: 0px;
  bottom: 0;
  top: 0;
  transition: border-radius 0.18s ease-in-out, border-color 0.18s ease-in-out, box-shadow 0.18s ease-in-out;
}

.content-shadow.opened {
  box-shadow: 0px 12px 25px -4px rgba(0,0,0,0.58);
  border-radius: 8px;
}

.container.focused:not(.overlay) {
  border-color: var(--primary-color-light, var(--primary-color));
}

.container.overlay {
  border-radius: 8px;
  border-color: transparent;
}

anypoint-autocomplete anypoint-item {
  padding: 0 24px;
}

anypoint-autocomplete anypoint-dropdown,
anypoint-autocomplete anypoint-listbox {
  box-sizing: border-box;
}

anypoint-autocomplete anypoint-listbox {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: inherit;
  color: inherit;
}

.main-input {
  flex: 1;
  height: 40px;
  border: none;
  outline: none;
  margin-right: 8px;
  font-size: 1rem;
  background-color: inherit;
  color: inherit;
}

anypoint-autocomplete {
  bottom: 0;
}

anypoint-item > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-icon {
  cursor: pointer;
  transition: color 0.21s ease-in-out;
}

.toggle-icon:hover {
  color: var(--accent-color);
}

.toggle-icon.disabled {
  pointer-events: none;
  color: rgb(0 0 0 / 24%);
}

url-detailed-editor {
  background-color: #fff;
}

.params-editor {
  padding: 0 20px 20px 20px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: auto;
  box-sizing: content-box;
  background-color: inherit;
  color: inherit;
}
`;
