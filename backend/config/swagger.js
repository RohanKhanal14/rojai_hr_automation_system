import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Yukti.exe API",
      version: "1.0.0",
      description:
        "REST API for Yukti.exe: handles candidate registration, HR professional registration, OTP verification, and login.",
    },
    servers: [{ url: "http://localhost:3001" }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
      schemas: {
        //Enums
        ExperienceLevel: {
          type: "string",
          enum: ["Internship", "Entry Level", "Junior", "Mid Level", "Senior"],
        },
        //Candidate
        RegisterCandidateRequest: {
          type: "object",
          required: [
            "fullName",
            "phone",
            "email",
            "password",
            "preferredPosition",
            "experienceLevel",
          ],
          properties: {
            fullName: { type: "string", example: "John Doe" },
            phone: { type: "string", example: "+911234567890" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              example: "Secret@123",
              description:
                "Min 8 chars, must include uppercase, lowercase, number and special character (@$!%*?&)",
            },
            preferredPosition: {
              type: "array",
              items: { type: "string" },
              example: ["Backend Engineer", "Full Stack Engineer"],
              description: "At least one position required",
            },
            experienceLevel: {
              $ref: "#/components/schemas/ExperienceLevel",
            },
            avatarUrl: {
              type: "string",
              format: "uri",
              example: "https://example.com/avatar.jpg",
            },
            linkedInUrl: {
              type: "string",
              format: "uri",
              example: "https://linkedin.com/in/johndoe",
            },
          },
        },
        //HR Professional
        RegisterHrRequest: {
          type: "object",
          required: [
            "fullName",
            "phone",
            "email",
            "password",
            "company",
            "designation",
          ],
          properties: {
            fullName: { type: "string", example: "Jane Smith" },
            phone: { type: "string", example: "+919876543210" },
            email: {
              type: "string",
              format: "email",
              example: "jane@company.com",
            },
            password: { type: "string", example: "Secret@123" },
            company: { type: "string", example: "Acme Corp" },
            designation: { type: "string", example: "HR Manager" },
            avatarUrl: {
              type: "string",
              format: "uri",
              example: "https://example.com/avatar.jpg",
            },
            linkedInUrl: {
              type: "string",
              format: "uri",
              example: "https://linkedin.com/in/janesmith",
            },
          },
        },
        //User Login
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", example: "Secret@123" },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["otp"],
          properties: {
            otp: {
              type: "string",
              minLength: 6,
              example: "482910",
              description: "6-digit OTP sent to email",
            },
          },
        },
        //Job
        SalaryDto: {
          type: "object",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              enum: ["negotiable", "fixed", "range"],
              example: "range",
            },
            min: {
              type: "number",
              example: 40000,
              description: "Required when type is 'range'",
            },
            max: {
              type: "number",
              example: 80000,
              description: "Required when type is 'fixed' or 'range'",
            },
            period: {
              type: "string",
              enum: ["monthly", "yearly"],
              example: "monthly",
              description: "Required when type is 'fixed' or 'range'",
            },
          },
        },
        InterviewDto: {
          type: "object",
          required: ["num_questions", "questions"],
          properties: {
            num_questions: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              example: 3,
            },
            questions: {
              type: "array",
              items: { type: "string" },
              example: [
                "Describe a challenging project you shipped.",
                "How do you handle conflicting priorities?",
                "Walk me through your debugging process.",
              ],
              description: "Array length must equal num_questions",
            },
            interviewTone: {
              type: "string",
              enum: ["formal", "casual", "technical", "behavioral", "mixed"],
              default: "mixed",
              example: "technical",
            },
          },
        },
        CreateJobRequest: {
          type: "object",
          required: [
            "position",
            "experienceLevel",
            "description",
            "deadline",
            "shortlistCount",
            "interview",
          ],
          properties: {
            position: {
              type: "string",
              example: "Backend Engineer",
              description: "Must be a valid position from the predefined list",
            },
            experienceLevel: {
              $ref: "#/components/schemas/ExperienceLevel",
            },
            remote: {
              type: "boolean",
              default: false,
              example: false,
            },
            location: {
              type: "string",
              example: "Kathmandu",
              description:
                "Required when remote is false. Must be a valid Nepal city.",
            },
            description: {
              type: "string",
              example: "We are looking for a skilled Backend Engineer...",
            },
            deadline: {
              type: "string",
              format: "date",
              example: "2026-06-30",
              description: "Must be a future date",
            },
            shortlistCount: {
              type: "integer",
              minimum: 1,
              example: 5,
              description: "Max number of applicants to shortlist",
            },
            mustHaveSkills: {
              type: "array",
              items: { type: "string" },
              example: ["Node.js", "MongoDB", "REST APIs"],
              description: "Must be valid skills for the chosen position",
            },
            niceToHaveSkills: {
              type: "array",
              items: { type: "string" },
              example: ["Docker", "Redis"],
            },
            salary: {
              $ref: "#/components/schemas/SalaryDto",
              description: "Optional",
            },
            interview: {
              $ref: "#/components/schemas/InterviewDto",
            },
          },
        },
        UpdateJobRequest: {
          type: "object",
          description: "At least one field must be provided",
          properties: {
            experienceLevel: {
              $ref: "#/components/schemas/ExperienceLevel",
            },
            remote: { type: "boolean", example: true },
            location: {
              type: "string",
              example: "Pokhara",
              description: "Forbidden when remote is true",
            },
            description: { type: "string", example: "Updated description..." },
            deadline: {
              type: "string",
              format: "date",
              example: "2026-09-01",
            },
            shortlistCount: { type: "integer", minimum: 1, example: 10 },
            mustHaveSkills: {
              type: "array",
              items: { type: "string" },
              example: ["Node.js", "PostgreSQL"],
            },
            niceToHaveSkills: {
              type: "array",
              items: { type: "string" },
              example: ["Kubernetes"],
            },
            status: {
              type: "string",
              enum: ["Draft", "Published", "Closed"],
              example: "Published",
            },
            salary: { $ref: "#/components/schemas/SalaryDto" },
            interview: { $ref: "#/components/schemas/InterviewDto" },
          },
        },
        JobObject: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
            position: { type: "string", example: "Backend Engineer" },
            department: { type: "string", example: "Engineering" },
            experienceLevel: { type: "string", example: "Mid Level" },
            remote: { type: "boolean", example: false },
            location: { type: "string", example: "Kathmandu" },
            description: { type: "string" },
            deadline: { type: "string", format: "date-time" },
            shortlistCount: { type: "integer", example: 5 },
            mustHaveSkills: {
              type: "array",
              items: { type: "string" },
            },
            niceToHaveSkills: {
              type: "array",
              items: { type: "string" },
            },
            salary: { $ref: "#/components/schemas/SalaryDto" },
            interview: { $ref: "#/components/schemas/InterviewDto" },
            status: {
              type: "string",
              enum: ["Draft", "Published", "Closed"],
            },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        //Application
        ApplicationStatus: {
          type: "string",
          enum: ["Applied", "Shortlisted", "Not Selected", "Under-Review"],
          example: "Applied",
        },
        SubmitApplicationRequest: {
          type: "object",
          required: ["jobId"],
          properties: {
            jobId: {
              type: "string",
              example: "664f1a2b3c4d5e6f7a8b9c0d",
              description: "MongoDB ObjectId of the job being applied to",
            },
            cv: {
              type: "string",
              format: "binary",
              description: "PDF file — max 5 MB",
            },
          },
        },
        CvObject: {
          type: "object",
          properties: {
            originalName: { type: "string", example: "john_doe_cv.pdf" },
            file: {
              type: "string",
              description:
                "Base64 data URI returned by the server: data:application/pdf;base64,...",
              example: "data:application/pdf;base64,JVBERi0xLjQ...",
            },
          },
        },
        ApplicationSummaryObject: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            jobId: {
              type: "object",
              nullable: true,
              description: "Null if the job was deleted",
              properties: {
                _id: { type: "string" },
                position: { type: "string", example: "Backend Engineer" },
                department: { type: "string", example: "Engineering" },
                status: { type: "string", example: "Published" },
                deadline: { type: "string", format: "date-time" },
              },
            },
            status: { $ref: "#/components/schemas/ApplicationStatus" },
            appliedAt: { type: "string", format: "date-time" },
          },
        },
        ApplicationDetailObject: {
          type: "object",
          properties: {
            job: { $ref: "#/components/schemas/JobObject" },
            status: { $ref: "#/components/schemas/ApplicationStatus" },
            appliedAt: { type: "string", format: "date-time" },
            cv: { $ref: "#/components/schemas/CvObject" },
            candidate: {
              type: "object",
              description:
                "Populated candidate profile — only present when accessed by an HR professional",
            },
          },
        },
        //Rankings & Shortlisting
        RankingItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
            applicationId: {
              type: "string",
              example: "664f1a2b3c4d5e6f7a8b9c1e",
              description: "MongoDB ID of the application",
            },
            jobId: {
              type: "string",
              example: "664f1a2b3c4d5e6f7a8b9c2e",
              description: "MongoDB ID of the job",
            },
            candidateId: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "664f1a2b3c4d5e6f7a8b9c3e",
                },
                fullName: { type: "string", example: "John Doe" },
                phone: { type: "string", example: "+911234567890" },
              },
            },
            atsScore: {
              type: "number",
              minimum: 0,
              maximum: 100,
              example: 85,
              description: "ATS match score percentage (0-100)",
            },
            cvSummary: {
              type: "string",
              example:
                "Strong backend engineer with 5+ years experience in Node.js and MongoDB",
              description: "Groq AI-generated CV summary",
            },
          },
        },
        ShortlistResponse: {
          type: "object",
          properties: {
            totalApplications: {
              type: "integer",
              example: 42,
              description: "Total applications for the job",
            },
            shortlisted: {
              type: "integer",
              example: 5,
              description: "Number of candidates marked as Shortlisted",
            },
            rejected: {
              type: "integer",
              example: 37,
              description: "Number of candidates marked as Not Selected",
            },
          },
        },
        //AI Interview
        StartInterviewResponseObject: {
          type: "object",
          properties: {
            assistantConfig: {
              type: "object",
              description:
                "Transient Vapi assistant config returned by backend and passed directly to vapi.start()",
            },
            sessionId: {
              type: "string",
              example: "665a1b2c3d4e5f6a7b8c9d0e",
            },
            numQuestions: { type: "integer", example: 3 },
            position: { type: "string", example: "Backend Engineer" },
            candidateName: { type: "string", example: "John Doe" },
          },
        },
        SaveCallIdRequest: {
          type: "object",
          required: ["vapiCallId"],
          properties: {
            vapiCallId: {
              type: "string",
              example: "call_123abc456def",
              description:
                "Vapi call ID emitted on call-start event and required for webhook session matching",
            },
          },
        },
        VapiWebhookRequest: {
          type: "object",
          properties: {
            message: {
              type: "object",
              description:
                "Webhook payload sent by Vapi. Server processes type=end-of-call-report.",
              properties: {
                type: { type: "string", example: "end-of-call-report" },
                call: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "call_123abc456def" },
                  },
                },
                artifact: {
                  type: "object",
                  properties: {
                    transcript: { type: "string" },
                    messages: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
        //Common Responses
        SuccessResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            success: { type: "boolean", example: true },
          },
        },
        RegisterInitResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: {
              type: "string",
              description:
                "JWT token — pass as :token path param in /verify endpoint",
            },
            success: { type: "boolean", example: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } },
              ],
            },
            success: { type: "boolean", example: false },
          },
        },
        //Password Reset
        TokenResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: {
              type: "string",
              description: "JWT token — pass as :token path param in next step",
            },
            success: { type: "boolean", example: true },
          },
        },
        ResetRequestBody: {
          type: "object",
          required: ["email", "role"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["candidate", "hr_professional"],
              example: "candidate",
            },
          },
        },
        ResetPasswordBody: {
          type: "object",
          required: ["password"],
          properties: {
            password: {
              type: "string",
              example: "NewSecret@123",
              description:
                "Min 8 chars — uppercase, lowercase, number and special character (@$!%*?&)",
            },
          },
        },
      },
    },
    paths: {
      //POST /api/v1/candidates
      "/api/v1/candidates": {
        post: {
          tags: ["Candidates"],
          summary: "Register a new candidate (Step 1)",
          description:
            "Encrypts the password, stores data in Redis, and returns a JWT token. The candidate must then verify their OTP via `/api/v1/users/verify/:token`.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterCandidateRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "OTP sent — use token to verify",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterInitResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      // POST /api/v1/hrProfessionals
      "/api/v1/hrProfessionals": {
        post: {
          tags: ["HR Professionals"],
          summary: "Register a new HR professional (Step 1)",
          description:
            "Encrypts the password, stores data in Redis, and returns a JWT token. The HR professional must then verify their OTP via `/api/v1/users/verify/:token`.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterHrRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "OTP sent — use token to verify",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterInitResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //GET /api/v1/users
      "/api/v1/users": {
        get: {
          tags: ["Users"],
          summary: "Get current logged-in user",
          description:
            "Returns the full profile of the authenticated user. Requires a valid access token cookie. If the access token is expired but the refresh token is valid, a new access token is issued automatically.",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Successfully retrieved user profile",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      currentUser: {
                        type: "object",
                        description:
                          "Login credentials record with populated candidateId or hrProfessionalId (password excluded)",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Users"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Successfully logged in",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            401: {
              description: "Invalid password",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/users/logout
      "/api/v1/users/logout": {
        post: {
          tags: ["Users"],
          summary: "Logout",
          description:
            "Clears the access and refresh token cookies. Requires a valid session (protected route).",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Successfully logged out",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/users/verify/:token
      "/api/v1/users/verify/{token}": {
        post: {
          tags: ["Users"],
          summary: "Verify OTP and complete registration (Step 2)",
          description:
            "Pass the JWT token received from registration as a path parameter, and the 6-digit OTP in the request body. 5 attempts allowed within 5 minutes.",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "JWT token received from the registration endpoint",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Account created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            400: {
              description: "Invalid OTP — includes attempts remaining",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Invalid/expired token or all attempts exhausted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Session expired (5-minute window passed)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/users/reset
      "/api/v1/users/reset": {
        post: {
          tags: ["Password Reset"],
          summary: "Request password reset OTP (Step 1)",
          description:
            "Validates email + role, stores a 6-digit OTP in Redis for 5 minutes, and returns a short-lived JWT reset token. The OTP is emailed to the user.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetRequestBody" },
              },
            },
          },
          responses: {
            200: {
              description: "OTP sent — use token in /reset-verify/:token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TokenResponse" },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Email not found or role mismatch",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/users/reset-verify/:token
      "/api/v1/users/reset-verify/{token}": {
        post: {
          tags: ["Password Reset"],
          summary: "Verify reset OTP (Step 2)",
          description:
            "Validates the JWT reset token and the 6-digit OTP. 5 attempts allowed within 5 minutes. On success returns a second short-lived JWT (JWT_NEW_PASSWORD_SECRET, 5 min) to authorise the password change.",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "JWT token received from POST /api/v1/users/reset",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
              },
            },
          },
          responses: {
            200: {
              description:
                "Identity verified — use returned token in /password/:token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TokenResponse" },
                },
              },
            },
            400: {
              description: "Invalid OTP — includes attempts remaining",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Invalid/expired token or all attempts exhausted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Session expired (5-minute window passed)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      // GET /api/v1/jobs/listings
      "/api/v1/jobs/listings": {
        get: {
          tags: ["Jobs"],
          summary: "Get all published job listings (Candidate only)",
          description:
            "Returns all jobs with status 'Published'. Only accessible by logged-in candidates. Returns a limited public subset of each job's fields.",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Successfully retrieved published jobs",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      jobsInfo: {
                        type: "array",
                        items: { $ref: "#/components/schemas/JobObject" },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated or not a candidate",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      // GET /api/v1/jobs/personal
      "/api/v1/jobs/personal": {
        get: {
          tags: ["Jobs"],
          summary: "Get HR's own job listings (HR only)",
          description:
            "Returns all jobs created by the authenticated HR professional, sorted by newest first. Includes full job details including Draft, Published, and Closed jobs.",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Successfully retrieved personal jobs",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      jobsInfo: {
                        type: "array",
                        items: { $ref: "#/components/schemas/JobObject" },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated or not an HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      // POST /api/v1/jobs
      "/api/v1/jobs": {
        post: {
          tags: ["Jobs"],
          summary: "Create a new job posting (HR only)",
          description:
            "Creates a new job linked to the authenticated HR professional. The department field is auto-derived from the position — do not include it in the request. Jobs are created with status 'Draft' by default.",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateJobRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Job created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated or not an HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //GET /api/v1/jobs/:id
      "/api/v1/jobs/{id}": {
        get: {
          tags: ["Jobs"],
          summary: "Get a specific job by ID (role-aware)",
          description:
            "Candidates see only Published jobs (limited fields). HR professionals see full details but only for their own jobs.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the job",
            },
          ],
          responses: {
            200: {
              description: "Successfully retrieved job",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      jobsInfo: { $ref: "#/components/schemas/JobObject" },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing job ID",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description:
                "Not authenticated, or HR trying to access another HR's job",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        //PATCH /api/v1/jobs/:id
        patch: {
          tags: ["Jobs"],
          summary: "Update a job (HR only)",
          description:
            "Updates one or more fields of a job. The job must be created by the authenticated HR and must be in Draft or Published status. Position and department cannot be changed. At least one field must be provided.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the job",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateJobRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Job updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      jobInfo: { $ref: "#/components/schemas/JobObject" },
                    },
                  },
                },
              },
            },
            400: {
              description: "Validation error or missing job ID",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated, job not yours, or job is Closed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        //DELETE /api/v1/jobs/:id
        delete: {
          tags: ["Jobs"],
          summary: "Delete a job (HR only)",
          description:
            "Permanently deletes a job. The job must be created by the authenticated HR and must be in Draft or Closed status. Published jobs cannot be deleted — close them first.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the job",
            },
          ],
          responses: {
            200: {
              description: "Job deleted successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            400: {
              description: "Missing job ID",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description:
                "Not authenticated, job not yours, or job is Published",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/applications
      "/api/v1/applications": {
        post: {
          tags: ["Applications"],
          summary: "Submit a job application (Candidate only)",
          description:
            "Upload a CV (PDF, max 5 MB) alongside a jobId to apply for a published job. Each candidate may apply to any given job only once (enforced by a unique index). The PDF is stored on Cloudinary and only a reference is kept in the database.",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  $ref: "#/components/schemas/SubmitApplicationRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Application submitted successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            400: {
              description:
                "Missing/invalid fields, non-PDF file, or file exceeds 5 MB",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated or not a candidate",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            409: {
              description: "Candidate has already applied to this job",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //GET /api/v1/applications/my
      "/api/v1/applications/my": {
        get: {
          tags: ["Applications"],
          summary: "Get my applications (Candidate only)",
          description:
            "Returns all applications submitted by the authenticated candidate, sorted newest first. Each item includes a lightweight job summary (position, department, status, deadline) and the application status.",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Applications retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/ApplicationSummaryObject",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated or not a candidate",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //GET /api/v1/applications/job/:id
      "/api/v1/applications/job/{jobId}": {
        get: {
          tags: ["Applications"],
          summary: "Get all applications for a job (HR only)",
          description:
            "Returns every application submitted for the specified job, sorted by applied date descending. The authenticated HR professional must be the creator of that job.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "jobId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the job",
            },
          ],
          responses: {
            200: {
              description: "Applications retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/ApplicationDetailObject",
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing job ID",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated or not an HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Job not owned by this HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //GET /api/v1/applications/:id
      "/api/v1/applications/{id}": {
        get: {
          tags: ["Applications"],
          summary: "Get one application by ID (role-aware)",
          description:
            "Candidates may only retrieve their own applications. HR professionals may retrieve any application whose job they own. Both roles receive the CV as a base64 data URI in the `cv.file` property. HR responses additionally include the `candidate` profile object.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the application",
            },
          ],
          responses: {
            200: {
              description: "Application detail retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      data: {
                        $ref: "#/components/schemas/ApplicationDetailObject",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing application ID",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description:
                "HR professional attempting to access an application for a job they do not own",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Application not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //GET /api/v1/jobs/:id/rankings
      "/api/v1/jobs/{id}/rankings": {
        get: {
          tags: ["Jobs", "Rankings"],
          summary: "Get ranked candidates for a job (HR only)",
          description:
            "Returns all applications for a job ranked by ATS score (descending). Includes candidate info, ATS score, and CV summary. Authenticated HR professional must own the job.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the job",
            },
          ],
          responses: {
            200: {
              description: "Rankings retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/RankingItem",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated or not an HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Job not owned by this HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Job not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/jobs/:id/shortlist
      "/api/v1/jobs/{id}/shortlist": {
        post: {
          tags: ["Jobs", "Shortlisting"],
          summary: "Trigger shortlisting for a job (HR only)",
          description:
            "Manually triggers shortlisting: updates application statuses (top N → 'Shortlisted', rest → 'Not Selected'), and creates/updates aiInterviewSession with shortlisted candidates. Authenticated HR professional must own the job.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the job",
            },
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description: "Empty body",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Shortlisting completed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Shortlisting completed",
                      },
                      success: { type: "boolean", example: true },
                      data: {
                        $ref: "#/components/schemas/ShortlistResponse",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated or not an HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Job not owned by this HR professional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Job not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/interviews/start/:id
      "/api/v1/interviews/start/{id}": {
        post: {
          tags: ["AI Interview"],
          summary: "Initialize interview session for shortlisted candidate",
          description:
            "Candidate-only endpoint. Validates interview eligibility, marks candidate interview status as In-Progress, and returns transient Vapi assistant config.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the aiInterviewSession",
            },
          ],
          responses: {
            200: {
              description: "Interview initialized successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string" },
                      data: {
                        $ref: "#/components/schemas/StartInterviewResponseObject",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description:
                "Session closed, invalid session, or already completed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Candidate is not shortlisted for this interview",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Candidate or interview session not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //PATCH /api/v1/interviews/active/:id
      "/api/v1/interviews/active/{id}": {
        patch: {
          tags: ["AI Interview"],
          summary: "Save Vapi call ID for active interview",
          description:
            "Candidate-only endpoint. Stores vapiCallId inside candidate session so webhook can match end-of-call payload.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the aiInterviewSession",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaveCallIdRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Call ID saved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing vapiCallId or invalid session id",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Candidate not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //POST /api/v1/interviews/webhook
      "/api/v1/interviews/webhook": {
        post: {
          tags: ["AI Interview"],
          summary: "Vapi end-of-call webhook receiver",
          description:
            "Public webhook endpoint called by Vapi. On type=end-of-call-report it analyzes transcript via Groq, updates aiInterviewSession candidate result, and updates ranking interview fields.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VapiWebhookRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Webhook acknowledged",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      received: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
            404: {
              description: "Session or candidate session not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      //PATCH /api/v1/users/password/:token
      "/api/v1/users/password/{token}": {
        patch: {
          tags: ["Password Reset"],
          summary: "Set new password (Step 3)",
          description:
            "Verifies the final reset JWT (JWT_NEW_PASSWORD_SECRET), hashes the new password with bcrypt, updates the login credentials document, and sends a confirmation email.",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
              description:
                "JWT token received from POST /api/v1/users/reset-verify/:token",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordBody" },
              },
            },
          },
          responses: {
            200: {
              description: "Password updated — user can now log in",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            401: {
              description: "Invalid or expired token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
