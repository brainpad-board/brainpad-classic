# Simulator

The JavaScript simulator lets you run and test most @boardname@ programs in the browser.
It simulates sensor inputs and user interactions.

##  #example

```sim
input.buttonLeft.onEvent(ButtonEvent.Click, function () {
    lightbulb.setColor(0xffff00)
})
input.buttonRight.onEvent(ButtonEvent.Click, function () {
    for (let i = 0; i < 2; i++) {
        lightbulb.setColor(0x00ff00)
        loops.pause(200)
        lightbulb.setColor(0x000000)
        loops.pause(200)
    }
})
```
