{
    ;("use strict")
    //luxon DateTime object
    const dt = luxon.DateTime

    //workhours-block-generation
    const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17]

    //element-objects
    const elementString = {
        tagName: ["p", "textarea", "button", "div"],
        classes: [
            "col-1 hour text-end",
            "col-6 border border-dark border-3",
            "saveBtn col-1 btn rounded-0 fs-3",
            "w-100 d-none my-1 d-md-block",
        ],
        attributes: [],
    }

    const timeblockEl = document.querySelector("#timeblock")

    //Get and Store any schedule items in localStorage
    let storedSchedule = localStorage.getItem("schedule") || []

    //current hour formatted
    let currentHour = dt.local().hour

    //display todays Date
    setInterval(function () {
        const todayEl = document.querySelector("#currentDay")
        let dateLocal = dt.local().toLocaleString(dt.DATE_FULL)
        todayEl.textContent = dateLocal
    }, 1000)

    const formatHour = (timeStamp) => {
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

    //HTML Elemenet builder
    function buildEl(tagName, elText, cssString, elAttr) {
        let el = document.createElement(tagName)
        el.className = cssString
        el.textContent = elText
        if (tagName === "button") {
            el.innerHTML = `<i class="bi bi-save2"></i>`
        }
        for (let i = 0; i < elAttr.length; i++) {
            el.setAttribute(
                elAttr[i].toString().split(" ")[0],
                elAttr[i].toString().split(" ")[1]
            )
        }
        return el
    }

    for (let i = 0; i < workHours.length; i++) {
        for (let e = 0; e < elementString.tagName.length; e++) {
            let eName = elementString.tagName[e]
            let text = eName === "p" ? formatHour(workHours[i]) : ""
            let eClasses = elementString.classes[e]
            elementString.attributes = []
            if (eName === "button") {
                elementString.attributes.push(`type ${eName}`)
            }
            elementString.attributes.push(`id ${eName}-${workHours[i]}`)
            elementString.attributes.push(`data-hour ${workHours[i]}`)
            timeblockEl.appendChild(
                buildEl(eName, text, eClasses, elementString.attributes)
            )
        }
    }

    timeblockEl.addEventListener("click", function (event) {
        const element = event.target
        let timeBlock = ""
        let textarea

        if (
            element.localName === "button" &&
            element.hasAttribute("data-hour")
        ) {
            timeBlock = element.getAttribute("data-hour")
            textarea = document.getElementById(`${timeBlock}-textarea`)

            if (textarea.value.trim() === "") {
                textarea.classList.add("warning")
                textarea.setAttribute("placeholder", "Nothing in textbox!")
            } else {
                textarea.classList.remove("warning")
            }
        }
    })
}
