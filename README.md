# Bootcamp Week 4 Work Day Scheduler

## Project Details

**Live Demo - https://minusinfinite.github.io/Work-Day-Scheduler/**

This week was a focus on working with third-party libraries and frameworks.
With a focus on [Bootstrap](https://getbootstrap.com/), JQuery and Moment.

The features from JQuery and Moment are quite matured at this point, for this project I used vanilla JS and [Luxon](https://moment.github.io/luxon/#/) as the Date utility.

For this project, the following User Story was provided.

## User Story

> AS AN employee with a busy schedule
>
> I WANT to add important events to a daily planner
>
> SO THAT I can manage my time effectively

The following GIF was given as a demo of expected functionality.
As well as an HTML template and CSS Stylesheet

![Application Functional Demo](./assets/md/demo.gif)

## Acceptance Criteria and Development process

> GIVEN I am using a daily planner to create a schedule
>
> WHEN I open the planner
>
> THEN the current day is displayed at the top of the calendar

To use a library such as Luxon from the browser it is important to add it to the HTML

```html
<script
    src="https://cdn.jsdelivr.net/npm/luxon@1.27.0/build/global/luxon.min.js"
    integrity="sha256-cJnCTPRTD3OUjTD4Ml0WEMsmTiLl71arKaZ9DEZJk0o="
    crossorigin="anonymous"
></script>
```

If your script you can then call the libraries namespace, in this case, `luxon`. It is then possible to create a global `setInterval` to continually update and track DateTime

```javascript
const dt = luxon.DateTime

setInterval(function () {
    const todayEl = document.querySelector("#currentDay")
    let dateLocal = dt.local().toLocaleString(dt.DATE_FULL)
    todayEl.textContent = dateLocal
}, 1000)
```

This is set with a delay of 1 second due to a function needed later in the development.

> WHEN I scroll down
>
> THEN I am presented with timeblocks for standard business hours

Frameworks like Bootstrap often end up with a `class` attribute as long as a sane person character limit.
I found it a requirement to have a way to dynamically store the required page structure without having it HTML itself.

As such the following was devised as a solution

```javascript
function buildEl(tagName, elText, cssString, elAttr) {
    let el = document.createElement(tagName)
    el.className = cssString
    el.textContent = elText
    for (let i = 0; i < elAttr.length; i++) {
        el.setAttribute(
            elAttr[i].toString().split(" ")[0],
            elAttr[i].toString().split(" ")[1]
        )
    }
    return el
}
```

The function above was made to make a valid DOMString for all required elements.
It would likely be possible to extend this function to account for additional child elements but that wasn't needed for this project

With the above function created the following object was used to store the required tag, class and the array to assign the ids and data-\* attributes for later

```javascript
const elementStrings = {
    tagName: ["p", "textarea", "button", "div"],
    classes: [
        "col-sm-1 hour text-end",
        "col-sm-6 border border-dark border-1",
        "saveBtn col-sm-1 btn rounded-0 fs-3",
        "w-100 d-none my-1 d-sm-block",
    ],
    attributes: [],
}
```

This is the array made for standard work hours, this is used to create unique ids and data-\* attributes

```javascript
const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
```

This comes together with the following `for` loop

```javascript
for (let i = 0; i < workHours.length; i++) {
    for (let e = 0; e < elementStrings.tagName.length; e++) {
        let eName = elementStrings.tagName[e]
        let text = ""
        let eClasses = elementStrings.classes[e]
        elementStrings.attributes = []
        if (eName === "p") {
            text = formatHour(workHours[i])
        }
        if (eName === "textarea") {
            text = savedSchedules[workHours[i]]
        }
        if (eName === "button") {
            elementStrings.attributes.push(`type ${eName}`)
        }
        elementStrings.attributes.push(`id ${eName}-${workHours[i]}`)
        elementStrings.attributes.push(`data-hour ${workHours[i]}`)
        timeblockEl.appendChild(
            buildEl(eName, text, eClasses, elementStrings.attributes)
        )
    }
}
```

One minor limitation of Luxon due to its use of the [`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) Javascript namespace to find a format DateTime properties having it add the Meridien AM/PM to the timestamp consistently was a hurdle.

To tackle this shortcoming the following utility was created.
This allowed for adding a format option without overthinking where the timeStamp was being provided.

```javascript
const formatHour = function (timeStamp) {
    let hour = ""
    if (timeStamp === 0) {
        hour = `${12}am`
    } else if (timeStamp === 12) {
        hour = `${12}pm`
    } else if (timeStamp > 12) {
        hour = timeStamp - 12 + "pm"
    } else {
        hour = `${timeStamp}am`
    }
    return hour
}
```

A feature, not in this brief could be to make a prompt for the user to specify their start time and duration of work, this could create more or fewer blocks as needed.

> WHEN I view the timeblocks for that day
>
> THEN each timeblock is color coded to indicate whether it is in the past, present, or future

For this requirement, the following function was created to compare the time to the textarea tags data-\* attribute.
If this matched the current hour it will add or remove the class required. The [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) property and methods made it easy to do without editing any other Layout classes.

```javascript
function updateTimeBlock() {
    const timeBlocks = document.querySelectorAll("textarea[data-hour")
    const currentHour = dt.local().hour

    for (let i = 0; i < timeBlocks.length; i++) {
        //data-* are always string values so a parseInt here confirms it will always be a number
        let currentBlock = parseInt(timeBlocks[i].getAttribute("data-hour"))
        if (currentBlock === currentHour) {
            timeBlocks[i].classList.add("present")
            timeBlocks[i].classList.remove("past")
            timeBlocks[i].classList.remove("future")
        } else if (currentBlock < currentHour) {
            timeBlocks[i].classList.remove("present")
            timeBlocks[i].classList.add("past")
            timeBlocks[i].classList.remove("future")
        } else if (currentBlock > currentHour) {
            timeBlocks[i].classList.remove("present")
            timeBlocks[i].classList.remove("past")
            timeBlocks[i].classList.add("future")
        }
    }
    confirm.classList.add("confirmed")
}
```

> WHEN I click into a timeblock
>
> THEN I can enter an event
>
> WHEN I click the save button for that timeblock
>
> THEN the text for that event is saved in local storage
>
> WHEN I refresh the page
>
> THEN the saved events persist

The following snippet provides the functions for tracking our button clicks and saving any entered text value

```javascript
timeblockEl.addEventListener("click", function (event) {
    const element = event.target
    let timeBlock = ""
    let textarea

    let scheduleEntry = {
        time: 0,
        entry: "",
    }

    if (element.localName === "button" && element.hasAttribute("data-hour")) {
        timeBlock = element.getAttribute("data-hour")
        textarea = document.getElementById(`textarea-${timeBlock}`)

        scheduleEntry.time = parseInt(timeBlock)
        scheduleEntry.entry = textarea.value.trim()
        localStorage.setItem(scheduleEntry.time, scheduleEntry.entry)

        scheduleObjects()
        confirm.classList.remove("confirmed")
    }
})
```

This is quite similar to our requirement from the last Project.
A difference here is that each textarea is equal to a given key in [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

As this has multiple keys to collect and recall data from the process of recalling them of refresh is a little different.

The snippet below takes the previously defined array of work hours and either make the same amount of objects.
This is called by another variable that is used to call the [Computed property name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names)
object values needed. When the page is built this it was possible to call the keys with bracket notation eg `text = savedSchedules[workHours[i]]`

```javascript
let scheduleObjects = function () {
    let obj = {}
    for (let i = 0; i < workHours.length; i++) {
        let savedTask = localStorage.getItem(workHours[i]) || ""
        obj[workHours[i]] = savedTask
    }
    return obj
}

const savedSchedules = scheduleObjects()
```
