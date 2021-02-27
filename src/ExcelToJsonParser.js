import React, { useState } from 'react';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import XLSX from 'xlsx';
import { make_cols } from './ColumObject';
import { SheetJSFT } from './types';
import JSONPretty from 'react-json-pretty';

export default function ExcelToJsonParser() {
	const [file, setFile] = useState({});
	const [scholarshipsData, setData] = useState({scholarships: []});
	const [cols, setCols] = useState([]);
	const keyMap = {
		"Scholarship Name": "name",
		'Degree Level': 'degreeLevel',
		'Categories': 'categories',
		'URL': 'url',
		'Award Amount': 'awardAmount',
		'App. Deadline': 'deadline',
		'Description': 'description',
	}


	const handleChange = e => {
		const files = e.target.files;
		if (files && files[0]) setFile(files[0]);
	};

	const handleSaveToPC = jsonData => {
		const fileData = JSON.stringify(jsonData);
		const blob = new Blob([fileData], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.download = 'scholarships.json';
		link.href = url;
		link.click();
	}

	const getSingleWorksheet = (wb, data) => {
		const wsname = wb.SheetNames[1];
		const ws = wb.Sheets[wsname];
		const newData = XLSX.utils.sheet_to_json(ws);
		let i = 0;
		newData.map(row => {
			let newObj = {};
			Object.keys(row).map(r => {
				 newObj['status'] = 'active';
				 newObj['month'] = 'February 2021';
				if (r === 'Categories')
					newObj[keyMap[r.trim()]] = typeof row[r] === 'string' ? setCategories(row[r]) : row[r];
				else
					newObj[keyMap[r.trim()]] = typeof row[r] === 'string' ? row[r].trim() : row[r];
			})
			data.push(newObj);
		})
	}

	const setCategories = (r) => {
		const items = r.split(',');
		return  items.map(item => {
			return item.trim();
		});
	}

	const getMultipleWorksheet = (wb, data) => {
		Object.keys(wb.Sheets).map(sheet => {
			let newData = {};
			/* Convert array of arrays */
			newData[sheet] = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
			data.push(newData);
		});
	}

	const manipulateData = (data) => {

	}

	const handleFile = () => {
		const reader = new FileReader();
		const rABS = !!reader.readAsBinaryString;

		reader.onload = (e) => {
			const scholarshipsData = { scholarships: [] }
			const data = scholarshipsData.scholarships;
			/* Parse data */
			const bstr = e.target.result;
			const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });

			// get single worksheet data
			getSingleWorksheet(wb, data);
			// get data for multiple worksheet
			// getMultipleWorksheet(wb, data);

			/* Update state */
			setData(scholarshipsData);
			setCols(cols);
			handleSaveToPC(scholarshipsData);
		};


		if (rABS) {
			reader.readAsBinaryString(file);
		} else {
			reader.readAsArrayBuffer(file);
		};
	}
	return (
		<div>
			<h3><label htmlFor="file">Upload an excel to convert to JSON</label></h3>
			<h4>Amit is making changes</h4>
			<br />
			<input type="file" className="form-control" id="file" accept={SheetJSFT} onChange={handleChange} />
			<br />
			<input type='submit'
				value="Convert and Save to Json"
				onClick={handleFile} />
			{scholarshipsData.scholarships.length > 0 && (
				<JSONPretty id="json-pretty" data={scholarshipsData}></JSONPretty>
			)}
		</div>
	)
}
