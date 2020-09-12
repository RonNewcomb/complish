export default class extends HTMLElement {
    static get observedAttributes() { return ['name', 'classes']; }
    constructor() {
        super();
        this.attachShadow({ mode: "open" }).innerHTML = template;
    }
    get name() { console.log('getter'); return this.getAttribute('name') || ""; }
    set name(v) { console.log('setter'); this.setAttribute('name', v); this.render(); }
    get classes() { console.log('getter'); return this.getAttribute('classes') || ""; }
    set classes(v) { console.log('setter'); this.setAttribute('classes', v); this.render(); }
    connectedCallback() {
        console.log("connectedCallback");
        this.render();
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        console.log("attributecanged", attr);
        if (oldValue === newValue)
            return;
        this[attr] = newValue;
    }
    render() {
        console.log("rendering");
        const r = this.shadowRoot;
        r.querySelector("#name").innerHTML = this.name;
        r.querySelector("#classes").className = this.classes;
    }
}
const template = ` 
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
   </style> `;
