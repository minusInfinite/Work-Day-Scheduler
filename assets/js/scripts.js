{
    ;("use strict")
    //luxon DateTime object
    const dt = luxon.DateTime

    //an array of expected work hours
    const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17]

    //The details of the HTML elements needed to be injected
    const elementStrings = {
        tagName: ["p", "textarea", "button", "div"],
        classes: [
            "col-sm-1 hour text-end",
            "col-sm-6 border border-dark border-1",
            "saveBtn col-sm-1 btn rounded-end-1 fs-3 bi bi-save2",
            "w-100 d-none my-1 d-sm-block",
        ],
        attributes: [],
    }

    //fixed HTML Element selectors.
    const timeblockEl = document.querySelector("#timeblock")
    const confirm = document.querySelector("#saved")

    //this is mostly due to Luxon using Intl api.
    //It doesn't appear to have a reliable option to enforce the use of a meridien AM/PM
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

    //Get and Store any schedule items in localStorage
    let scheduleObjects = function () {
        let obj = {}
        for (let i = 0; i < workHours.length; i++) {
            let savedTask = localStorage.getItem(workHours[i]) || ""
            obj[workHours[i]] = savedTask
        }
        return obj
    }

    //this varible allows the generated objects to be accessed.
    const savedSchedules = scheduleObjects()

    //HTML Elemenet builder
    function buildEl(tagName, elText, cssString, elAttr) {
        let el = document.createElement(tagName)
        el.className = cssString
        el.textContent = elText
        //this loops of the provided elAttr array
        for (let i = 0; i < elAttr.length; i++) {
            el.setAttribute(
                elAttr[i].toString().split(" ")[0],
                elAttr[i].toString().split(" ")[1]
            )
        }
        return el
    }

    //checked the current time and the schedule and updated the textarea bgcolor
    function updateTimeBlock() {
        const timeBlocks = document.querySelectorAll("textarea[data-hour]")
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

    //display todays Date and triggers the Update Function
    setInterval(function () {
        const todayEl = document.querySelector("#currentDay")
        let dateLocal = dt.local().toLocaleString(dt.DATE_FULL)
        todayEl.textContent = dateLocal
        //this will update the textarea colors
        updateTimeBlock()
    }, 1000) //

    //take the Element Strings object and add them to the DOM
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
                //due to the object entries being data generated only braket notation is allowed
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

    //This EventListener is to capture the generated element on in the Time block container
    timeblockEl.addEventListener("click", function (event) {
        const element = event.target
        let timeBlock = ""
        let textarea

        let scheduleEntry = {
            time: 0,
            entry: "",
        }

        if (
            element.localName === "button" &&
            element.hasAttribute("data-hour")
        ) {
            timeBlock = element.getAttribute("data-hour")
            textarea = document.getElementById(`textarea-${timeBlock}`)

            scheduleEntry.time = parseInt(timeBlock)
            scheduleEntry.entry = textarea.value.trim()
            localStorage.setItem(scheduleEntry.time, scheduleEntry.entry)

            scheduleObjects()
            confirm.classList.remove("confirmed")
        }
    })
}
