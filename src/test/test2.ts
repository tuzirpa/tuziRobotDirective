function getElementToScreen(element: HTMLElement) {
    const { x, y } = element.getBoundingClientRect();
    let xDiff = 8;
    let yDiff = 8;
    let barHeight = window.outerHeight - window.innerHeight;
    barHeight = window.screen.availHeight === window.outerHeight ? barHeight : barHeight - yDiff;
    xDiff = window.screen.availHeight === window.outerHeight ? 0 : xDiff;
    return {
        x: window.screenX + x + xDiff,
        y: window.screenY + y + barHeight
    };
}
