import Canvy from './Canvy/index.js'

const canvas = document.querySelectorAll('#canvas');

const canvy = new Canvy(canvas)

const data = [200, 100, 50];

// canvy.drawPie('fig', {
//     fillColors: ['#0000ff', '#ff0000', '#ffff00'],
//     data
// })
//
// for (let i = 0; i < data.length; i++) {
//     canvy.on(`fig${i}`, 'click', () => {
//         canvy.animate(`fig${i}`, {
//             radius: canvy.canvas.canvas.height / 2 - 80,
//             strokeColor: '#ff00ff',
//             fillColor: '#ff00ff'
//         }, 150)
//     })
// }

canvy.drawCircle('cir1', {
    centerX: 150,
    centerY: 150
})

function rand(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from)
}

document.querySelector('.add-circle').addEventListener('click', () => {
    const elems = canvy.elements.length;
    canvy.drawCircle(`fig${elems}`, {
        radius: rand(50, 250),
        centerX: rand(0, 1000),
        centerY: rand(0, 500),
        fillColor: '#ff0000',
        startAngle: 0,
        endAngle: rand(0, 360),
    })
})

document.querySelector('.add-rect').addEventListener('click', () => {
    const elems = canvy.elements.length;
    canvy.drawRect(`fig${elems}`, {
        width: rand(50, 250),
        height: rand(50, 250),
        x: rand(0, 1000),
        y: rand(0, 500),
        fillColor: '#00ff00'
    })

    const startParams = canvy.get(`fig${elems}`).params;

    canvy.startCycle(`fig${elems}`, [
        {
            params: {
                fillColor: startParams.fillColor,
                width: startParams.width,
                height: startParams.height,
                x: startParams.x,
                y: startParams.y
            },
            duration: 300
        },
        {
            params: {
                fillColor: '#ff0000',
                width: rand(10, 200),
                height: rand(10, 300),
                x: rand(0, 1000),
                y: rand(0, 500)
            },
            duration: 300
        },
    ])

    canvy.on(`fig${elems}`, 'click', () => {
        canvy.levelDown(`fig${elems}`)
    })
})

document.querySelector('.add-poly').addEventListener('click', () => {
    const elems = canvy.elements.length;
    canvy.drawPolygon(`fig${elems}`, {
        vertex: [
            [rand(0, 1000), rand(0, 500)],
            [rand(0, 1000), rand(0, 500)],
            [rand(0, 1000), rand(0, 500)],
            [rand(0, 1000), rand(0, 500)],
            [rand(0, 1000), rand(0, 500)],
        ],
        fillColor: '#0000ff'
    })
})

document.querySelector('.animate-random').addEventListener('click', () => {
    const elems = canvy.elements.length;
    const fig = `fig${rand(0, elems - 1)}`
    canvy.startCycle(fig, [
        {
            params: {
                fillColor: canvy.get(fig).params.fillColor
            },
            duration: 500
        },
        {
            params: {
                fillColor: '#556644'
            },
            duration: 500
        }
    ])
})

document.querySelector('.stop-all').addEventListener('click', () => {
    for (let i = 0; i < canvy.elements.length; i++) {
        const name = canvy.get(canvy.elements[i].name).name;
        canvy.stopCycle(name, false);
    }
})


