# Restaurant API Documentation

## Overview
This document describes the restaurant profile API used by restaurant managers to create or update a restaurant profile. All fields are grouped into components based on the requested categories.

- Base endpoint: `POST /restaurant/update-profile`
- Authentication: `RestaurantAuthProtect` middleware (restaurant user only)
- Content type: `multipart/form-data`
- File fields: `coverImage`, `restaurantImage`

## API Reference

| Component | Method | API Endpoint | Request Body | Response Body | Success Message | Error |
|---|---|---|---|---|---|---|
| Personal Info | POST | `/restaurant/update-profile` | `contactDetails`: { `email`: string, `phone`: string }
| | | | `managerId` is provided by server from authenticated user; not required in form-data | `message`: string
`data`: restaurant object | - `Restaurant profile created successfully`
- `Restaurant profile updated successfully` |- `400 Missing required field: <field>`
- `401 Unauthorized` / `403 Forbidden`
- `500 Internal Server Error` |
| Restaurant Info | POST | `/restaurant/update-profile` | `restaurantName`: string
`description`: string
`restaurantType`: string (one of `veg`, `non-veg`, `jain`, `vegan`, `both`)
`cuisineTypes`: string[]
`servingHours`: { `openingTime`: string, `closingTime`: string }
`isOpen`: boolean
`status`: string (`active`, `inactive`, `blocked`)
`averageRating`: number
`restaurantImage`: file[] (multiple restaurant photos)
`coverImage`: file | `message`: string
`data`: restaurant object | see success message above | see errors above |
| Address | POST | `/restaurant/update-profile` | `address`: string
`city`: string
`state`: string
`pinCode`: string
`country`: string
`geoLocation`: { `lat`: string, `lon`: string } | `message`: string
`data`: restaurant object | see success message above | see errors above |
| Bank and Document | POST | `/restaurant/update-profile` | `financialDetails`: { `bankName`: string, `accountNumber`: string, `ifscCode`: string }
`documents`: { `legalName`: string, `companyType`: string, `gstCertificate`: string, `fssaiCertificate`: string, `panCard`: string } | `message`: string
`data`: restaurant object | see success message above | see errors above |
| Social Media | POST | `/restaurant/update-profile` | `socialMediaLinks`: [{ `platform`: string, `url`: string }, ...] | `message`: string
`data`: restaurant object | see success message above | see errors above |
| Legal Information | POST | `/restaurant/update-profile` | `documents`: { `legalName`: string, `companyType`: string, `gstCertificate`: string, `fssaiCertificate`: string, `panCard`: string } | `message`: string
`data`: restaurant object | see success message above | see errors above |

## Notes
- The endpoint is used for both creating a new restaurant profile and updating an existing one.
- When an existing restaurant profile is not found for the authenticated restaurant manager, the API creates a new profile and returns `201`.
- When a profile already exists, the API updates the existing record and returns `200`.
- Uploaded images are stored using the restaurant image upload utility and saved on the restaurant object as URLs and public IDs.
- The API currently validates that every provided body field is non-empty; empty strings or missing nested values may trigger `400 Missing required field: <field>`.
