# Doctor's Dashboard - Rehabilitation Plan Input Module

A modern web application for doctors to create and manage rehabilitation plans for patients. The application provides an intuitive interface for inputting patient information, exercise parameters, and generating reports.

## Features

- Patient Information Management
  - Patient ID and Name
  - Rehabilitation Phase Selection (Early, Mid, Late)
- Measurement Input
  - Leg Length Measurement
- Exercise Parameters
  - Hip Flexion (Target Angle, Hold Time, Repetitions)
  - Knee Flexion (Target Angle, Hold Time, Repetitions)
  - Heel Raise (Target Height, Hold Time, Repetitions)
- Training Frequency
  - Sessions per Day Configuration
- Report Generation and Management
  - Generate Rehabilitation Reports
  - Send Reports to Patient Interface

## Technical Stack

- React with TypeScript
- Material-UI for modern UI components
- Formik for form handling and validation
- Yup for schema validation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Development

The application is built with React and TypeScript, providing type safety and better development experience. The UI is constructed using Material-UI components for a consistent and modern look.

### Project Structure

```
src/
  ├── components/
  │   └── InputModule.tsx    # Main input form component
  ├── types/
  │   └── index.ts          # TypeScript type definitions
  ├── App.tsx               # Root component
  └── index.tsx            # Application entry point
```

### Form Validation

The application uses Formik for form handling and Yup for validation. The validation schema ensures:

- Required fields are filled
- Numeric values are positive
- Angles are within valid ranges (0-180 degrees)
- Training frequency is within reasonable limits

### Data Flow

1. Doctor inputs patient information and exercise parameters
2. System automatically calculates hip flexion height based on leg length and target angle
3. Data is validated and saved
4. Reports can be generated and sent to the patient interface

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
