/**
 * Created by gleicher on 9/20/15.
 */
function setupPanel() {
    var panel = document.getElementById("controls");
    panel = panel || document.getElementById("controls");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "panel";
        document.body.appendChild(panel);
    }
    return panel;
}
function makeCheckBoxes(names, callback, perRow) {
    "use strict";
    var panel = setupPanel();
    var buttons = {};
    perRow = perRow || 4;

    names.forEach(function(b,i) {
        var bname,binit;

        if (typeof(b) === "string") {
            bname = b;
            binit = false;
        } else {
            bname = b[0];
            binit = b.length ? b[1] : false;
        }

        if (i && (i%perRow===0))
            panel.appendChild(document.createElement("BR"));
        var span = document.createElement("SPAN");
        var button = document.createElement("INPUT");
        var label = document.createTextNode(bname);
        span.appendChild(button);
        span.appendChild(label);

        span.style.width = '150px';
        span.style.display = "inline-block";

        button.id = bname;
        button.setAttribute("type", "checkbox");
        button.checked = binit;
        button.addEventListener("change",callback);
        buttons[bname] = button;

        panel.appendChild(span);
    });
    panel.appendChild(document.createElement("BR"));
    return buttons;
}

function makeSliders(names, callback, perRow) {
    "use strict";
    var panel = setupPanel();
    var buttons = {};
    perRow = perRow || 4;

    names.forEach(function(b,i) {
        "use strict";
        var bname,bmin,bmax,bval;

        if (typeof(b) === "string") {
            bname = b;
            bmin = 0;
            bmax = 10;
            bval = 0;
        } else {
            bname = b[0];
            bmin = b.length ? b[1] : 0;
            bmax = b.length ? b[2] : 10;
            bval = b.length ? b[3] : 5;
        }

        if (i && (i%perRow===0))
            panel.appendChild(document.createElement("BR"));
        var span = document.createElement("SPAN");
        var button = document.createElement("INPUT");
        var label = document.createTextNode(bname);
        span.appendChild(button);
        span.appendChild(label);

        span.style.width = '300px';
        span.style.display = "inline-block";

        button.id = bname;
        button.setAttribute("type", "range");
        button.width = 200;
        button.min = bmin;
        button.max =  bmax;
        button.value = bval;
        button.addEventListener("input",callback);
        buttons[bname] = button;

        panel.appendChild(span);
    });
    addBR();
    return buttons;
}

function makeRadio(names, group, callback, perRow) {
    "use strict";
    var panel = setupPanel();
    var buttons = {};
    perRow = perRow || 4;

    names.forEach(function(b,i) {
        if (i && (i%perRow===0))
            panel.appendChild(document.createElement("BR"));
        var span = document.createElement("SPAN");
        var button = document.createElement("INPUT");
        var label = document.createTextNode(b);
        span.appendChild(button);
        span.appendChild(label);

        span.style.width = '100px';
        span.style.display = "inline-block";

        button.id = b;
        button.setAttribute("type", "radio");
        button.setAttribute("name", group);
        button.checked = i ? false : true;
        button.addEventListener("change",callback);
        buttons[b] = button;

        panel.appendChild(span);
    });
    addBR();
    return buttons;
}


// keep track of the buttons - since we can't add them at once since
// they don't have a single callback
var buttons = {};
var numButtons = 0;
function addButton(name, callback) {
    "use strict";
    var panel = setupPanel();

    if ((numButtons) % 6 === 5) {
        panel.appendChild(document.createElement("BR"));
    }
    numButtons++;

    var span = document.createElement("SPAN");
    var button = document.createElement("Button");
    var label = document.createTextNode(name);
    span.appendChild(button);
    button.appendChild(label);

    span.style.width = '120px';
    span.style.display = "inline-block";

    button.id = name;
    button.setAttribute("type", "checkbox");
    button.addEventListener("click", callback);
    buttons[name] = button;
    panel.appendChild(span);
    return button;
}

function addBR() {
    "use strict";
    var panel = setupPanel();
    panel.appendChild(document.createElement("BR"));
}

