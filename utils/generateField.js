 const Field = (x,y)=> {

				let x0 = 0
				let y0 = 0
				let column = []
				while(y0<y) {
					let row = []
					while(x0<x) {
						row.push({location: [x0,y0]})
						x0++
					}
					column.push(row)
					x0=0
					y0++
				}
				return column

}

module.exports = Field