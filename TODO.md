# TO-Do:

- ~~Spin up MongoDB server using Atlas~~
- ~~Add Mongoose to project~~
- ~~Add Schemas & models for Product and Category~~
- ~~Populate database with custom populatedb.js file~~
- ~~Add routes & controllers for index, products, categories~~
- ~~Add 'READ' views~~
- ~~Add forms & controllers for Category Create/Update/Delete~~
- ~~Add forms & controllers for Product Create/Update/Delete~~
- ~~Deploy!~~
- ~~Password-protect create/update/delete POSTs~~
- Check password & return unauthorized error IN CONSISTENT WAY

  - (right now, sometimes it throws an error, sometimes it re-renders form w error message, sometimes it doesn't show correct error, etc., because all my _other_ error handling is also inconsistent)

- Add image upload functionality
  - `multer` to receive files from form and save locally
  - `cloudinary` to upload local files to persistent storage
  - add _optional_ image url field to Category and Product schemas
  - save cloudinary url in associated document

# (Lower Priority)

- Test rebuilding on another machine & make any necessary adjustments to README instructions
- Add profanity filter
- Refactor populatedb so I can uninstall async
- extend populatedb to pull data from csv file

# Issues:

- express-validator's isUUID function doesn't seem to work with MongoDB urls
