const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const fileUpload = require("express-fileupload");
app.use(express.json());

app.use(fileUpload());

const port = 9000;

const pathToFrontend = path.join(`${__dirname}/../frontend`);

app.get("/", (req, res, next) => {
	res.sendFile(`${pathToFrontend}/index.html`);
});

app.get("/image-list", (req, res, next) => {
	res.sendFile(`${pathToFrontend}/data.json`);
});

const uploads = path.join(`${pathToFrontend}/img/`);

// If there is a data.json, read the data from the file, if not, use an empty Array
let jsonData = [];
try {
	let data = fs.readFileSync(`${pathToFrontend}/data.json`, (error) => {
		if (error) {
			console.log(error);
		}
	});
	jsonData = JSON.parse(data);
} catch (error) {
	fs.writeFile(
		`${pathToFrontend}/data.json`,
		JSON.stringify(jsonData),
		(error) => {
			if (error) {
				console.log(error);
			}
		}
	);
}

const getFreeId = () => {
	let ids = [];
	jsonData.forEach((element) => {
		ids.push(parseInt(element.id));
	});

	return ids.length === 0 ? 0 : Math.max(...ids) + 1;
};

app.post("/", (req, res) => {
	// Upload image
	const picture = req.files.picture;

	if (picture) {
		picture.mv(uploads + picture.name, (error) => {
			return res.status(500).send(error);
		});
	}

	// Upload data from form
	const formData = req.body;
	formData.id = getFreeId();
	formData.filename = req.files.picture.name;
	jsonData.push(formData);

	fs.writeFile(
		`${pathToFrontend}/data.json`,
		JSON.stringify(jsonData),
		(error) => {
			if (error) {
				console.log(error);
			}
		}
	);
	res.send(formData);
});

app.delete("/delete/:id", (req, res) => {
	let newJsonData = [];
	jsonData.forEach((element) => {
		if (element.id.toString() === req.params.id) {
			console.log(element);
			const removePath = __dirname + "/../frontend/img/" + element.filename;
			console.log(removePath);
			try {
				fs.unlinkSync(removePath);
			} catch (err) {
				console.error(err);
			}
		} else {
			newJsonData.push(element);
		}
	});

	fs.writeFile(
		`${pathToFrontend}/data.json`,
		JSON.stringify(newJsonData),
		(error) => {
			if (error) {
				console.log(error);
			}
		}
	);
	jsonData = newJsonData;

	res.sendStatus(200);
});

app.use("/pub", express.static(`${pathToFrontend}/pub`));
app.use("/img", express.static(`${pathToFrontend}/img`));

app.listen(port, () => {
	console.log(`http://127.0.0.1:${port}`);
});
