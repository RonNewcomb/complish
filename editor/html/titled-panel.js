"use strict";
class TitledPanel extends HTMLElement {
    static get observedAttributes() { return ['name', 'classes']; }
    connectedCallback() {
        this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
        render(this);
    }
    get name() { return this.getAttribute('name') || ""; }
    set name(v) { this.setAttribute('name', v); render(this); }
    get classes() { return this.getAttribute('classes') || ""; }
    set classes(v) { this.setAttribute('classes', v); render(this); }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (oldValue !== newValue)
            this[attr] = newValue;
    }
}
const render = ({ name, classes, shadowRoot }) => {
    shadowRoot.querySelector("#name").innerHTML = name;
    shadowRoot.querySelector("#classes").className = classes;
};
const template = new DOMParser().parseFromString(` 
<template>
<div class="panel">
  <div class="hitbox">
    <div class="peekaboo" id="name"></div>
      </div>
  <div id="classes">
    <slot></slot>
  </div>
</div>
<style>
  .panel {
    background-color: hsl(39deg 77% 90%); /* "light wheat" */
    border-radius: 10px;
    border: 2px solid white;
    margin: 10px;
    padding: 14px;
    position: relative;
  }
  .hitbox {
    position: absolute;
    top: -0.7em;
    width: 90%;
  }
  .peekaboo {
    background-color: #333;
    color: white;
    border: 1px solid white;
    transform: scaleY(0);
    transition: transform 250ms;
    border-radius: 1em;
    padding: 2px 5px;
    font-size: x-small;
    display: inline-block;
  }
  .hitbox:hover .peekaboo,
  .panel:hover .peekaboo {
    transform: scaleY(1);
  }
   </style></template>`, 'text/html').querySelector('template');
customElements.define('titled-panel', TitledPanel);
