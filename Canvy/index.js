export default class Canvy {
    constructor(element) {
        this.#init(element)
    }

    #init(element) {
        if (!element) this.#throwError('Please pass the element parameter');
        const canvas = typeof element === 'string' ? document.querySelector(element) : element[0].nodeType ? element[0] : null
        if (!canvas) this.#throwError('Can not find canvas element');

        this.canvas = {
            canvas,
            left: canvas.offsetLeft + canvas.clientLeft,
            top: canvas.offsetTop + canvas.clientTop,
            context: canvas.getContext('2d')
        }
        this.elements = [];
        this.#initListeners()
    }

    #throwError(errorText) {
        throw new Error(errorText)
    }

    // some figures

    drawCircle(name, params = {}) {

        if (
            typeof name !== 'string' ||
            this.elements.filter(item => item.name === name).length !== 0
        )
            this.#throwError(`Element with same name (${name}) already exists`)

        const standardParams = {
            centerX: 15,
            centerY: 15,
            radius: 15,
            startAngle: this.#changeAngle(0),
            endAngle: this.#changeAngle(360),
            strokeColor: '#000000',
            strokeWidth: 1,
            fillColor: '#000000'
        }

        if (params.endAngle) {
            params.endAngle = this.#changeAngle(params.endAngle)
        }
        if (params.startAngle) {
            params.startAngle = this.#changeAngle(params.startAngle)
        }

        Object.assign(standardParams, params);

        this.elements.push({
            name, params: standardParams, listeners: [], type: 'circle', animationQueue: [], inCycle: false
        })

        this.#draw()
    }

    drawRect(name, params = {}) {

        if (
            typeof name !== 'string' ||
            this.elements.filter(item => item.name === name).length !== 0
        )
            this.#throwError(`Element with same name (${name}) already exists`)

        const standardParams = {
            x: 15,
            y: 15,
            width: 15,
            height: 15,
            strokeColor: '#000000',
            strokeWidth: 1,
            fillColor: '#000000'
        }

        Object.assign(standardParams, params);

        this.elements.push({
            name, params: standardParams, listeners: [], type: 'rect', animationQueue: [], inCycle: false
        })

        this.#draw()
    }

    drawPolygon(name, params = {}) {

        if (
            typeof name !== 'string' ||
            this.elements.filter(item => item.name === name).length !== 0
        )
            this.#throwError(`Element with same name (${name}) already exists`)

        const standardParams = {
            vertex: [
                [15, 15],
                [25, 25],
                [50, 50]
            ],
            strokeColor: '#000000',
            strokeWidth: 1,
            fillColor: '#000000'
        }

        Object.assign(standardParams, params);

        this.elements.push({
            name, params: standardParams, listeners: [], type: 'polygon', animationQueue: [], inCycle: false
        })

        this.#draw()
    }

    drawPie(namePrefix, params = {}) {
        if (
            typeof namePrefix !== 'string' ||
            this.elements.filter(item => item.name.startsWith(namePrefix)).length !== 0
        )
            this.#throwError(`Element with same prefix (${namePrefix}) already exists`)

        const standardParams = {
            centerX: 300,
            centerY: 250,
            radius: 150,
            startAngle: this.#changeAngle(0),
            endAngle: this.#changeAngle(360),
            strokeColor: '#000000',
            strokeWidth: 1,
            fillColors: ['#ff0000', '#00ff00', '#0000ff'],
            data: [100, 200, 300],
            hole: true,
            holeRadius: 130,
            holeFillColor: '#ffffff',
            holeStrokeColor: '#ffffff',
            holeStrokeWidth: 0
        }

        if (params.endAngle) {
            params.endAngle = this.#changeAngle(params.endAngle)
        }
        if (params.startAngle) {
            params.startAngle = this.#changeAngle(params.startAngle)
        }

        Object.assign(standardParams, params);

        let myTotal = 0;
        let lastEnd = standardParams.startAngle;

        for (let i = 0; i < standardParams.data.length; i++) {
            myTotal += standardParams.data[i];
        }

        for (let i = 0; i < standardParams.data.length; i++) {
            this.drawCircle(`${namePrefix}${i}`, {
                fillColor: standardParams.fillColors[i],
                radius: standardParams.radius,
                centerX: standardParams.centerX,
                centerY: standardParams.centerY,
                strokeWidth: standardParams.strokeWidth,
                strokeColor: standardParams.strokeColor,
                startAngle: lastEnd,
                endAngle: (standardParams.data[i] * 360 / myTotal) + lastEnd
            })

            lastEnd += (standardParams.data[i] * 360 / myTotal);
        }

        if (standardParams.hole) {
            this.drawCircle(`${namePrefix}InnerHole`, {
                fillColor: standardParams.holeFillColor,
                radius: standardParams.holeRadius,
                centerX: standardParams.centerX,
                centerY: standardParams.centerY,
                strokeWidth: standardParams.holeStrokeWidth,
                strokeColor: standardParams.holeStrokeColor,
                startAngle: 0,
                endAngle: 360
            })
        }
    }

    remove(name) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);
        this.elements.splice(index, 1);

        this.#draw();
    }

    //

    // some technics

    #draw() {
        this.#clear()

        this.elements.forEach(item => {
            this.canvas.context.beginPath();
            const { params } = item;
            const index = this.elements.findIndex(x => x.name === item.name);
            let figure = new Path2D();
            switch (item.type) {
                case 'rect': {
                    figure.moveTo(params.x, params.y);
                    figure.rect(
                        params.x,
                        params.y,
                        params.width,
                        params.height
                    )
                    break;
                }
                case 'circle': {
                    figure.moveTo(params.centerX, params.centerY)
                    figure.arc(
                        params.centerX,
                        params.centerY,
                        params.radius,
                        params.startAngle,
                        params.endAngle,
                        false);
                    figure.lineTo(params.centerX, params.centerY)
                    break;
                }
                case 'polygon': {
                    figure.moveTo(item.params.vertex[0][0], item.params.vertex[0][1])
                    item.params.vertex.forEach((vert, i) => {
                        figure.lineTo(vert[0], vert[1]);
                    })
                    figure.lineTo(item.params.vertex[0][0], item.params.vertex[0][1]);
                    break;
                }
            }

            this.canvas.context.fillStyle = params.fillColor;
            this.canvas.context.fill(figure);
            this.canvas.context.lineWidth = params.strokeWidth;
            this.canvas.context.strokeStyle = params.strokeColor;
            this.canvas.context.stroke(figure);

            this.canvas.context.closePath();
            this.elements[index].element = figure;
        })
    }

    #colorString(color) {
        function colorNameToHex(color) {
            const colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
                "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
                "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
                "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
                "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
                "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
                "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
                "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
                "honeydew":"#f0fff0","hotpink":"#ff69b4",
                "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
                "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
                "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
                "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
                "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
                "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
                "navajowhite":"#ffdead","navy":"#000080",
                "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
                "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
                "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
                "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
                "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
                "violet":"#ee82ee",
                "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
                "yellow":"#ffff00","yellowgreen":"#9acd32"};

            if (typeof colours[color.toLowerCase()] != 'undefined')
                return colours[color.toLowerCase()];

            return false;
        }
        if (typeof color === 'string') {
            if (colorNameToHex(color)) {
                return colorNameToHex(color);
            }
            return color.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                ,(m, r, g, b) => '#' + r + r + g + g + b + b)
                .substring(1).match(/.{2}/g)
                .map(x => parseInt(x, 16))
        } else {
            return '#' + [color[0], color[1], color[2]].map(x => {
                const hex = x.toString(16)
                return hex.length === 1 ? '0' + hex : hex
            }).join('')
        }
    }

    #changeAngle(angle) {
        return Math.PI / 180 * angle;
    }

    #clear() {
        this.canvas.context.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    }

    #initListeners() {
        this.canvas.canvas.addEventListener('click', (e) => {
            const x = e.offsetX, y = e.offsetY;
            for (let i = this.elements.length - 1; i >= 0; i--) {
                if (this.canvas.context.isPointInPath(this.elements[i].element, x, y)) {
                    const clickCallback = this.elements[i].listeners.findIndex(x => x?.handler === 'click');
                    if (!(this.elements[i].listeners[clickCallback]?.handler === 'click')) {
                        break;
                    }
                    this.elements[i].listeners[clickCallback].callback(this.elements[i])
                    break;
                }
            }
        })

        const MOUT = (name) => {
            this.stopCycle(name)
            const elementsWithMOUT = this.elements.filter(item => item.listeners.map(listener => listener.handler === 'mouseout').length > 0);
            elementsWithMOUT.forEach(item => {
                const MOUTCallback = item.listeners.findIndex(x => x?.handler === 'mouseout');

                if (MOUTCallback !== -1) item.listeners[MOUTCallback].callback(item);

            })
        }

        this.canvas.canvas.addEventListener('mousemove', (e) => {
            const x = e.offsetX, y = e.offsetY;

            for (let j = this.elements.length - 1; j >= 0; j--) {
                if (this.canvas.context.isPointInPath(this.elements[j].element, x, y)) {
                    const MOVERCallback = this.elements[j].listeners.findIndex(x => x?.handler === 'mouseover');
                    if (MOVERCallback === -1) {
                        MOUT(this.elements[j].name);
                        break;
                    }
                    this.elements[j].listeners[MOVERCallback].callback(this.elements[j])
                } else {
                    for (let i = this.elements.length - 1; i >= 0; i--) {
                        if (this.elements[i].name === this.elements[j].name) {
                            const MOUTCallback = this.elements[i].listeners.findIndex(x => x?.handler === 'mouseout');
                            if (MOUTCallback !== -1) {
                                this.elements[i].listeners[MOUTCallback].callback(this.elements[i])
                            }
                        }
                    }
                }

            }
        })

        this.canvas.canvas.addEventListener('mouseout', () => {
            MOUT();
        })
    }

    //

    on(name, handler, callback) {
        if (!name || !handler || !callback || typeof callback !== 'function') return;
        const elementIndex = this.elements.findIndex(x => x.name === name);
        this.elements[elementIndex].listeners.push({
            handler,
            callback
        })
    }

    // level manipulate

    levelUp(name) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);

        if (index === this.elements.length - 1) {
            return;
        }

        const element = this.elements[index];
        this.elements.splice(index, 1)
        this.elements.splice(index + 1, 0, element)

        this.#draw()
    }

    levelDown(name) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);

        if (index === 0) {
            return;
        }

        const element = this.elements[index];

        this.elements.splice(index, 1)
        this.elements.splice(index - 1, 0, element)

        this.#draw()
    }

    toTop(name) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);

        if (index === this.elements.length - 1) {
            return;
        }

        const element = this.elements[index];
        this.elements.splice(index, 1)
        this.elements.push(element)

        this.#draw()
    }

    toBottom(name) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);

        if (index === 0) {
            return;
        }

        const element = this.elements[index];
        this.elements.splice(index, 1)
        this.elements.unshift(element)

        this.#draw()
    }

    setLevel(name, level) {
        if (!name || typeof name !== 'string' || !level || typeof level !== 'number') return;
        const index = this.elements.findIndex(x => x.name === name);

        if (index === level) {
            return;
        }
        if (level > this.elements.length - 1) {
            level = this.elements.length - 1
        }
        if (level < 0) {
            level = 0;
        }

        const element = this.elements[index];

        this.elements.splice(index, 1)
        this.elements.splice(level, 0, element)

        this.#draw()
    }

    //

    // params manipulate

    set(name, params = {}) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);
        const element = this.elements[index];

        const oldParams = element.params;
        Object.assign(oldParams, params);
        element.params = oldParams;

        this.#draw()
    }

    animate(name, params = {}, duration = 1000) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);
        const element = this.elements[index];

        const startParams = this.get(name).params;

        const calcStep = (oldVal, newVal, progress) => {
            return Math.floor(progress * (newVal - oldVal) + oldVal);
        }

        const animate = (options) => {

            const { params, startParams, duration } = options

            let startTimestamp = performance.now();
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                for (let key in params) {
                    if (typeof params[key] === 'string') {
                        element.params[key] = this.#colorString([
                            calcStep(this.#colorString(startParams[key])[0], this.#colorString(params[key])[0], progress),
                            calcStep(this.#colorString(startParams[key])[1], this.#colorString(params[key])[1], progress),
                            calcStep(this.#colorString(startParams[key])[2], this.#colorString(params[key])[2], progress)
                        ])
                    } else if (Array.isArray(params[key])) {
                        for (let i = 0; i < params[key].length; i++) {
                            element.params[key][i][0] = calcStep(startParams[key][i][0], params[key][i][0], progress)
                            element.params[key][i][1] = calcStep(startParams[key][i][1], params[key][i][1], progress)
                        }
                    } else {
                        element.params[key] = calcStep(startParams[key], params[key], progress)
                    }

                    this.#draw();
                }

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    if (element.inCycle) {
                        element.animationQueue.splice(0, 1);
                        if (element.animationQueue.length) {
                            animate(
                                element.animationQueue[0]
                            )
                        }
                    } else {
                        element.animationQueue = []
                    }
                }
            };
            window.requestAnimationFrame(step);
        }

        if (element.animationQueue.length === 0) {
            element.animationQueue.push({
                params,
                startParams,
                duration
            });
            animate(element.animationQueue[0]);
        } else {
            element.animationQueue.push({
                params,
                startParams: element.animationQueue.at(-1).params,
                duration
            });
        }

    }

    startCycle(name, animations) {
        if (!name || typeof name !== 'string' || !animations || !Array.isArray(animations)) return;
        const elementIndex = this.elements.findIndex(x => x.name === name);
        const element = this.elements[elementIndex];
        element.inCycle = true;

        const calcDuration = () => {
            return animations.reduce((item, cur) => {
                if (typeof item === 'object') {
                    return cur.duration + item.duration;
                } else {
                    return cur.duration + item;
                }
            })
        }

        let allDuration = calcDuration();

        if (!element.inCycle) return;

        animations.forEach(animation => {
            this.animate(name, animation.params, animation.duration)
        })



        const interval = setInterval(() => {
            if (!element.inCycle) {
                clearInterval(interval)
                return;
            }
            animations.forEach(animation => {
                this.animate(name, animation.params, animation.duration)
            })
            allDuration = calcDuration();
        }, allDuration)
    }

    stopCycle(name, clearQueue = false) {
        if (!name || typeof name !== 'string') return;
        if (!name) return;
        const elementIndex = this.elements.findIndex(x => x.name === name);
        const element = this.elements[elementIndex];
        element.inCycle = false;
        if (clearQueue) {
            element.animationQueue = [];
        }
    }

    //

    get(name) {
        if (!name || typeof name !== 'string') return;
        const index = this.elements.findIndex(x => x.name === name);
        if (index === -1) return;
        return JSON.parse(JSON.stringify(this.elements[index]));
    }

}


