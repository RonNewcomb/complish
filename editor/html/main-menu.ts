
import { ask } from "./modal-dialogs.js";

customElements.define('main-menu', class extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' }).innerHTML = template();
    this.shadowRoot!.querySelectorAll('.topbar .submenu > div').forEach(el =>
      el.addEventListener("click", e => ask((e!.target! as any).innerText, ["OK", "Cancel"]).then(result => console.log("You chose", result)))
    )
  }
});

function template() {
  return/*html*/`
<div class="topbar">
  <flex-row wrap>
    <div class="mainMenuItem">
      File
      <div class="submenu">
        <div>New</div>
        <div>Open...</div>
        <div>Save</div>
        <div>Save As...</div>
        <div>Close</div>
        <hr />
        <div>Exit</div>
      </div>
    </div>
    <div class="mainMenuItem">
      Edit
      <div class="submenu">
        <div>Cut</div>
        <div>Copy</div>
        <div>Paste</div>
        <hr />
        <div>Preferences...</div>
      </div>
    </div>
    <div class="mainMenuItem">
      Run
      <div class="submenu">
        <div>Build</div>
        <div>Rebuild</div>
        <div>Clean</div>
        <hr />
        <div>Walkthrough</div>
      </div>
    </div>
    <div class="mainMenuItem">
      Help
      <div class="submenu">
        <div>Reference</div>
        <div>Tutorial</div>
        <hr />
        <div id="about">About</div>
      </div>
    </div>
  </flex-row>
</div>
<style>
  .topbar {
    margin: 0;
    padding: 0 10px;
    background-color: #333;
    color: white;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .mainMenuItem {
    padding: 14px 16px;
  }

  .submenu {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 2;
    margin-top: 14px;
    margin-left: -16px;
  }

  .submenu > div {
    display: block;
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    cursor: pointer;
  }

  .mainMenuItem:hover,
  .submenu > div:hover {
    background-color: tan;
  }

  .mainMenuItem:hover .submenu {
    display: block;
  }
</style>
`};