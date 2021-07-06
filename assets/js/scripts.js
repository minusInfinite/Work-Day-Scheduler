{
    ;("use strict")
    //luxon DateTime object
    const dt = luxon.DateTime

    //display todays Date
    setInterval(function () {
        const dateEl = document.querySelector("#currentDay")
        let dateLocal = dt.local().toLocaleString(dt.DATE_FULL)
        dateEl.textContent = dateLocal
    }, 1000)

    //workhours-block-generation
    const workHours = [
        "9am",
        "10am",
        "11am",
        "12pm",
        "1pm",
        "2pm",
        "3pm",
        "4pm",
        "5pm",
    ]
    //element-objects
    const timeblockEl = document.querySelector("#timeblock")
}
