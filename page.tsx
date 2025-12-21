"use client"

import * as React from "react"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  ArrowRight,
  Code,
  TrendingUp,
  Shield,
  CheckCircle,
  Star,
  Play,
  Menu,
  X,
  Users,
  Award,
  Sparkles,
  Rocket,
  Target,
  Brain,
  MessageSquare,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  ExternalLink,
  Clock,

  Settings,
  FileText,
  ArrowLeft,
  Monitor,
  Smartphone,
  Database,
  Video,
  Camera,
  Mic,
  ShoppingBag,
  Cloud,
  Terminal,
  Cpu,
  Code2,
  Server,
  Layers,
  GitBranch,
  Package,
  Activity,
  BarChart3,
  Heart,
  Bookmark,
  Mail,
  Phone,
  RefreshCw,
  Briefcase,
  GraduationCap,
  BadgeIcon as Certificate,
  Trophy,
  Lightbulb,
  Tablet,
  Laptop,
  Calendar,
  Zap,
} from "lucide-react"

// Define types for form data
interface ContactFormData {
  name: string
  email: string
  company: string
  budget: string
  message: string
}

// Modal content interfaces
interface ServiceDetail {
  title: string
  description: string
  features: string[]
  technologies: string[]
  process: string[]

  timeline: string
  benefits: string[]
}

interface PortfolioDetail {
  title: string
  category: string
  description: string
  challenge: string
  solution: string
  results: string[]
  technologies: string[]
  timeline: string
  testimonial: string
  images: string[]
}

interface TeamMemberDetail {
  name: string
  role: string
  expertise: string
  bio: string
  experience: string
  education: string[]
  certifications: string[]
  projects: string[]
  social: { linkedin: string; github: string; twitter: string }
}

interface StatDetail {
  number: string
  label: string
  icon: any
  details: string
  metrics: string[]
  achievements: string[]
}

interface TestimonialDetail {
  name: string
  role: string
  company: string
  content: string
  rating: number
  image: string
  results: string[]
  projectType: string
  duration: string
  satisfaction: string
}

interface InsightDetail {
  title: string
  description: string
  date: string
  author: string
  readTime: string
  category: string
  tags: string[]
  content: string
  relatedTopics: string[]
}

export default function AdvancedTechWebsite() {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  })
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({})
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    services: false,
    company: false,
  })
  const [showAllTechnologies, setShowAllTechnologies] = useState(false)
  const [activePolicy, setActivePolicy] = useState<string | null>(null)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    rating: 0,
    feedback: "",
  })
  const [feedbackErrors, setFeedbackErrors] = useState<Record<string, string>>({})

  // Refs for sections
  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    services: useRef<HTMLElement>(null),
    solutions: useRef<HTMLElement>(null),
    portfolio: useRef<HTMLElement>(null),
    team: useRef<HTMLElement>(null),
    insights: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  }

  // Horizontal scroller refs
  const servicesScrollRef = useRef<HTMLDivElement | null>(null)
  const portfolioScrollRef = useRef<HTMLDivElement | null>(null)
  const testimonialsScrollRef = useRef<HTMLDivElement | null>(null)
  const teamScrollRef = useRef<HTMLDivElement | null>(null)

  const scrollHorizontally = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    const node = ref.current
    if (!node) return
    const amount = node.clientWidth * 0.8
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  const { toast } = useToast()

  // Toggle expanded sections
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Policy modal functions
  const openPolicy = (policy: string) => {
    setActivePolicy(policy)
  }

  const closePolicy = () => {
    setActivePolicy(null)
  }

  // Scroll animations removed

  // Service details data
  const serviceDetails: Record<string, ServiceDetail> = {
    "Shopify Websites": {
      title: "Shopify Website Development & Modifications",
      description:
        "Complete Shopify store development, modifications, and optimization services designed to maximize your e-commerce revenue through stunning designs, engaging animations, and powerful upselling & cross-selling features.",
      features: [
        "Custom Shopify Store Development",
        "Shopify Theme Modifications",
        "Advanced Animations & Effects",
        "Upselling & Cross-selling Integration",
        "Product Page Optimization",
        "Checkout Flow Enhancement",
        "Revenue-Boosting Features",
        "App Integration & Setup",
      ],
      technologies: ["Shopify", "Liquid", "JavaScript", "CSS3", "Shopify APIs", "Shopify Apps", "Klaviyo", "ReCharge"],
      process: [
        "Store Strategy & Planning",
        "Design & Branding",
        "Development & Customization",
        "Animations & Effects Setup",
        "Upsell/Cross-sell Configuration",
        "Testing & Launch",
      ],
      
      timeline: "2-8 weeks",
      benefits: [
        "Increased Conversion Rates",
        "Higher Average Order Value",
        "Engaging User Experience",
        "Professional Brand Image",
        "Mobile-Optimized Design",
        "Revenue Growth",
      ],
    },
    "Business Systems": {
      title: "Custom Business Systems & SaaS",
      description: "Tailored software systems and SaaS solutions designed specifically for your industry - from courier management to accounting platforms to medical healthcare systems.",
      features: [
        "Courier & Delivery Management",
        "Accounting & Invoicing Systems",
        "Medical & Healthcare SaaS",
        "Inventory & Warehouse Management",
        "Booking & Scheduling Platforms",
        "CRM & Customer Management",
        "Custom Dashboard & Analytics",
        "Industry-Specific Solutions",
      ],
      technologies: ["Next.js", "React", "Node.js", "PostgreSQL", "MongoDB", "Flutter", "REST APIs", "Cloud Services"],
      process: [
        "Requirements Analysis",
        "System Architecture Design",
        "UI/UX Design & Prototyping",
        "Development & Integration",
        "Testing & Quality Assurance",
        "Deployment & Training",
      ],
      
      timeline: "8-20 weeks",
      benefits: [
        "Streamlined Operations",
        "Reduced Manual Work",
        "Real-time Data & Insights",
        "Scalable Architecture",
        "Custom Workflows",
        "Dedicated Support",
      ],
    },
    "Automations": {
      title: "Smart Automation Solutions",
      description: "Intelligent automation services that handle repetitive tasks - from AI chatbots for customer support to automated product uploads and inventory syncing.",
      features: [
        "AI Chatbots & Support Bots",
        "Automated Product Uploads",
        "Inventory Auto-Sync",
        "Order Processing Automation",
        "Email & Marketing Automation",
        "Workflow Automation",
        "Data Integration & Sync",
        "Custom Bot Development",
      ],
      technologies: ["OpenAI", "Zapier", "Make", "n8n", "Python", "Node.js", "Shopify APIs", "Custom Integrations"],
      process: [
        "Process Analysis & Mapping",
        "Automation Strategy Design",
        "Bot & Workflow Development",
        "Integration & Testing",
        "Deployment & Monitoring",
        "Optimization & Scaling",
      ],
      
      timeline: "1-6 weeks",
      benefits: [
        "Time & Cost Savings",
        "Reduced Human Error",
        "24/7 Customer Support",
        "Faster Operations",
        "Scalable Processes",
        "Focus on Growth",
      ],
    },
  }

  // Portfolio details data
  const portfolioDetails: Record<string, PortfolioDetail> = {
    "Hollywood Clinic System": {
      title: "Hollywood Clinic Management System",
      category: "Healthcare Technology",
      description: "Comprehensive Flutter app with backend system for modern clinic management and patient care.",
      challenge:
        "Healthcare providers face increasing pressure to manage sensitive patient data securely while ensuring seamless appointment scheduling and medical compliance. Building a reliable clinic management system that protects patient information and streamlines operations is a major challenge for modern clinics and hospitals.",
      solution:
        "We developed a comprehensive Flutter-based clinic management app with a powerful backend system. The solution includes secure patient management, appointment scheduling, and medical compliance tools, delivering a robust platform for clinics to improve efficiency, enhance patient care, and maintain healthcare standards.",
      results: [
        "Streamlined appointment management",
        "Enhanced patient experience",
        "Medical compliance achieved",
        "Improved operational efficiency",
        "Fast and user-friendly interface",
      ],
      technologies: ["Flutter", "Dart", "Node.js", "PostgreSQL", "Firebase", "REST APIs"],
      timeline: "16 weeks",
      testimonial:
        "The platform built for our clinic made managing appointments and patients much easier. The app is fast, easy to use, and medically compliant. An excellent experience with a professional team.",
      images: [], // Remove images
    },
    "CourierX Platform": {
      title: "CourierX Integrated Courier System",
      category: "Logistics Technology",
      description: "Fully integrated courier platform with real-time tracking and smart dispatch system.",
      challenge:
        "In the fast-paced logistics and courier industry, businesses need more than just delivery—they need real-time package tracking, intelligent dispatching, and a user-friendly dashboard to streamline operations. Developing a reliable courier management system that improves delivery efficiency while enhancing customer experience is a critical challenge for modern logistics providers.",
      solution:
        "We created CourierX, a fully integrated Next.js courier management platform designed for smart logistics operations. The system features real-time package tracking, an AI-powered dispatch solution, and a comprehensive dashboard for operators and customers. This modern courier technology solution ensures seamless operations, improved efficiency, and higher customer satisfaction.",
      results: [
        "Real-time package tracking",
        "Intelligent dispatch system",
        "User-friendly dashboard",
        "Operational efficiency improved",
        "Customer satisfaction increased",
      ],
      technologies: ["Next.js", "React", "Node.js", "MongoDB", "Socket.io", "Google Maps API"],
      timeline: "20 weeks",
      testimonial:
        "We worked with the team on a fully integrated courier platform. Everything was precise: real-time tracking, an easy dashboard, and a smart dispatch system. They truly transformed how we work.",
      images: [], // Remove images
    },
    "Beauty Bar E-commerce": {
      title: "Beauty Bar Luxury E-commerce",
      category: "E-commerce Technology",
      description: "High-end Shopify e-commerce website for luxury beauty brands with advanced features.",
      challenge:
        "In the competitive luxury beauty e-commerce market, creating an online store is not enough—brands need a premium digital experience that reflects their elegance and exclusivity. The challenge was to design a high-end Shopify e-commerce platform that could effectively showcase luxury beauty brands, deliver advanced product filtering, and highlight products with elegant presentation to attract discerning customers",
      solution:
        "We developed a sophisticated Shopify e-commerce website tailored for luxury beauty brands, combining custom design, advanced filtering features, and seamless product presentation. Using Shopify’s robust ecosystem, including Liquid templates, Shopify APIs, and secure payment integrations, the platform delivers a luxurious shopping experience that enhances brand positioning, increases sales, and delights customers with an outstanding user experience",
      results: [
        "Increased sales significantly",
        "Luxurious brand presentation",
        "Advanced product filtering",
        "Outstanding customer experience",
        "Enhanced brand positioning",
      ],
      technologies: ["Shopify", "Liquid", "JavaScript", "CSS3", "Shopify APIs", "Payment Integration"],
      timeline: "12 weeks",
      testimonial:
        "The new website looks extremely luxurious and helped increase sales significantly. The advanced filtering and elegant product presentation made the customer experience outstanding. Thank you for the professional work.",
      images: [], // Remove images
    },
    "Montre Watch Collection": {
      title: "Montre Luxury Watch E-commerce",
      category: "E-commerce Technology",
      description: "Premium Shopify e-commerce platform for luxury watch collections and timepieces.",
      challenge:
        "In the luxury watch e-commerce market, customers expect more than just an online shop—they look for a sophisticated digital experience that mirrors the exclusivity of premium timepieces. The challenge was to build a high-end Shopify platform that could showcase luxury watches with elegant design, detailed product presentation, and a premium user experience that reinforces the prestige of luxury watch brands.",
      solution:
        "We developed a premium Shopify e-commerce website tailored for luxury watch collections and timepieces. The platform features a custom Shopify theme, elegant product showcases, and sophisticated brand presentation. Leveraging Shopify Plus, Liquid, and advanced customizations, we ensured a luxurious shopping journey that highlights craftsmanship, enhances customer engagement, and strengthens luxury brand positioning.",
      results: [
        "Premium brand presentation",
        "Elegant product showcases",
        "Enhanced user experience",
        "Increased customer engagement",
        "Luxury positioning achieved",
      ],
      technologies: ["Shopify", "Liquid", "JavaScript", "CSS3", "Shopify Plus", "Custom Themes"],
      timeline: "14 weeks",
      testimonial:
        "The luxury watch e-commerce platform perfectly captures our brand essence. The elegant design and sophisticated features have elevated our online presence significantly.",
      images: [], // Remove images
    },
    "TechCorp Brand Campaign": {
      title: "TechCorp Corporate Brand Campaign",
      category: "Media Production",
      description: "Comprehensive brand video campaign including corporate videos, product demos, and social media content for a leading tech company.",
      challenge:
        "In today’s competitive tech industry, establishing a strong corporate identity requires more than just a logo—it demands a cohesive brand campaign that reflects innovation and professionalism. The challenge was to showcase TechCorp’s cutting-edge products through a unified multimedia strategy, while maintaining corporate aesthetics across video content, product demos, and social media platforms.",
      solution:
        "We delivered a comprehensive brand video campaign designed to strengthen TechCorp’s corporate image and highlight its innovative technology solutions. The project included professional corporate videos, engaging product demonstrations, and dynamic social media content—all produced with consistent branding, high-quality visuals, and polished storytelling. Leveraging tools like Adobe Premiere Pro, After Effects, DaVinci Resolve, and Cinema 4D, we ensured a seamless media experience that resonates with both corporate audiences and end consumers",
      results: [
        "Enhanced brand perception",
        "Increased social media engagement",
        "Professional corporate presentation",
        "Consistent brand messaging",
        "Improved customer trust",
      ],
      technologies: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Cinema 4D", "Pro Tools", "Color Grading"],
      timeline: "8 weeks",
      testimonial:
        "The media production team delivered exceptional quality content that perfectly represents our brand. The videos have significantly improved our corporate image and customer engagement.",
      images: [], // Remove images
    },
    "RestaurantX Marketing Videos": {
      title: "RestaurantX Marketing Video Series",
      category: "Media Production",
      description: "Complete marketing video package including food photography, promotional videos, and social media content for a premium restaurant chain.",
      challenge:
        "In the competitive hospitality and fine dining industry, restaurants must stand out not only through food but also through their online brand presence. The challenge was to capture the essence of RestaurantX’s luxury dining experience, showcasing its premium atmosphere, gourmet dishes, and unique culinary journey. The goal was to produce engaging content that drives customer engagement, online visibility, and reservations.",
      solution:
        "We developed a complete video marketing package tailored for the restaurant industry. This included high-quality 4K promotional videos, professional food photography, behind-the-scenes storytelling, and customer testimonials to highlight RestaurantX’s premium dining experience. Leveraging the Adobe Creative Suite, advanced color grading, and social media optimization, we created compelling content that elevated the brand’s online presence and attracted new diners.",
      results: [
        "Increased social media following",
        "Enhanced online presence",
        "Improved customer engagement",
        "Professional food presentation",
        "Boosted reservation rates",
      ],
      technologies: ["4K Video Production", "Food Photography", "Adobe Creative Suite", "Color Grading", "Audio Enhancement", "Social Media Optimization"],
      timeline: "6 weeks",
      testimonial:
        "The video content has transformed how we present our restaurant online. The quality and creativity of the media production exceeded our expectations and has directly impacted our business growth.",
      images: [], // Remove images
    },
  }

  // Team member details
  const teamDetails: Record<string, TeamMemberDetail> = {
    "Heba Hesham": {
      name: "Heba Hesham",
      role: "Software Engineer",
      expertise: "Full-Stack Development & Scalable System Architecture",
      bio:"A highly skilled software engineer with 5+ years of experience in building enterprise-level web applications, robust backend systems, and cloud-based solutions. She specializes in React, Node.js, and AWS, combining modern frontend development with scalable backend architecture to deliver seamless, high-performing applications.",
      experience: "5+ years in software engineering and full-stack development",
      education: ["BS Computer Science", "Software Engineering Certification"],
      certifications: ["React Developer Professional", "Node.js Certified Developer", "AWS Cloud Practitioner"],
      projects: [
        "Led development of 20+ web applications",
        "Built scalable backend systems",
        "Implemented modern frontend solutions",
      ],
      social: { linkedin: "#", github: "#", twitter: "#" },
    },
  "Hams Assem": {
  name: "Hams Assem",
  role: "Software Engineer",
  expertise: "Full-Stack Development & Intelligent Systems",
  bio: "Hamsa Assem is a passionate software engineer with strong expertise in full-stack development and intelligent software solutions. She excels at building dynamic, user-friendly web applications and integrating smart technologies to create innovative digital experiences. With a background in Artificial Intelligence and Computer Engineering, she combines technical knowledge with creative problem-solving to deliver impactful software products.",
  experience: "Hands-on experience in modern web technologies and AI-powered solutions",
  education: [
    "BS in Computer Engineering (Artificial Intelligence specialization)",
    "Professional Training in Web & Mobile Development"
  ],
  certifications: [
    "JavaScript & React Advanced Certification",
    "Node.js Developer Certification",
    "Cloud Fundamentals (Azure & AWS)"
  ],
  projects: [
    "Developed and deployed multiple full-stack applications with modern frameworks",
    "Worked on AI-driven applications for smarter user experiences",
    "Built scalable APIs and integrated third-party services for cross-platform solutions"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
},

   "Ahmed Nassar": {
  name: "Ahmed Nassar",
  role: "(CEO)",
  expertise: "Business Strategy, Leadership & Digital Transformation",
  bio: "Ahmed Nassar is a visionary CEO with extensive experience in leading technology-driven organizations and driving sustainable growth. With a strong background in business strategy and innovation, he specializes in aligning technology solutions with corporate goals to maximize efficiency and market impact. Ahmed is known for his ability to build high-performing teams, foster strategic partnerships, and guide companies through digital transformation journeys.",
  experience: "10+ years in executive leadership and business development",
  education: [
    "MBA in Business Administration & Strategy",
    "Bachelor’s in Information Technology Management"
  ],
  certifications: [
    "Executive Leadership Certification",
    "Strategic Management Professional",
    "Digital Transformation Specialist"
  ],
  projects: [
    "Led the company’s expansion into multiple markets",
    "Successfully managed large-scale digital transformation initiatives",
    "Built strategic partnerships with leading global enterprises"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
},

"Ahmed Hussien": {
  name: "Ahmed Hussien",
  role: "Senior Software Engineer",
  expertise: "Advanced Full-Stack Development, Cloud Solutions & Technical Leadership",
  bio: "Ahmed Hussien is an experienced Senior Software Engineer with deep expertise in designing, developing, and optimizing large-scale applications. He excels in full-stack development, cloud-based solutions, and performance-driven system architecture. Known for mentoring junior developers and leading engineering teams, Ahmed plays a key role in delivering innovative software solutions that enhance business operations and customer experiences.",
  experience: "7+ years in software engineering and system design",
  education: [
    "BS in Computer Engineering",
    "Diploma in Advanced Software Architecture"
  ],
  certifications: [
    "Certified Kubernetes Administrator",
    "AWS Solutions Architect",
    "Professional React & Node.js Certification"
  ],
  projects: [
    "Architected and deployed enterprise-level applications",
    "Led development teams in agile environments",
    "Optimized cloud infrastructure for performance and scalability"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
},

"Mariam Khairy": {
  name: "Mariam Khairy",
  role: "Customer Service Specialist",
  expertise: "Customer Support, Client Relations & Communication",
  bio: "Mariam Khairy is a dedicated Customer Service Specialist with strong expertise in delivering exceptional client support and building lasting relationships. She excels at resolving customer inquiries, improving service quality, and ensuring a positive experience at every touchpoint. With a passion for communication and problem-solving, Mariam plays a vital role in enhancing customer satisfaction and fostering brand loyalty.",
  experience: "4+ years in customer service and client relationship management",
  education: [
    "BA in Business Communication",
    "Customer Service Management Diploma"
  ],
  certifications: [
    "Certified Customer Service Professional (CCSP)",
    "Conflict Resolution & Communication Skills Certification"
  ],
  projects: [
    "Improved customer satisfaction scores by implementing feedback-driven strategies",
    "Developed streamlined support workflows for faster response times",
    "Trained new customer service representatives to maintain service excellence"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
},

    "Farah Hawwas": {
      name: "Farah Hawwas",
      role: "Sales Manager",
      expertise: "Content Strategy & Creative Development",
      bio: "Fraha is a talented content creator who develops engaging content strategies that resonate with target audiences. She specializes in creating compelling visual and written content that drives engagement and supports marketing objectives.",
      experience: "3+ years in content creation",
      education: ["BS Communications", "Content Marketing Certification"],
      certifications: ["Content Marketing Specialist", "Social Media Content Creator", "Creative Writing Professional"],
      projects: [
        "Created content for 40+ brands",
        "Increased engagement rates by 300%",
        "Developed viral content campaigns",
      ],
      social: { linkedin: "#", github: "#", twitter: "#" },
    },
    "Ahmed Miery": {
  name: "Ahmed Miery",
  role: "Marketing Manager",
  expertise: "Digital Marketing, Brand Strategy & Campaign Management",
  bio: "Ahmed Miery is a results-driven Marketing Manager with proven expertise in creating and executing successful marketing strategies. He specializes in digital campaigns, brand positioning, and customer engagement, helping businesses strengthen their presence and drive measurable growth. With a creative mindset and data-driven approach, Ahmed ensures marketing initiatives deliver maximum impact and ROI.",
  experience: "7+ years in marketing and brand management",
  education: [
    "BA in Marketing & Business Administration",
    "Digital Marketing Certification"
  ],
  certifications: [
    "Google Ads Certified",
    "HubSpot Inbound Marketing Certification",
    "Facebook Blueprint Certification"
  ],
  projects: [
    "Led multiple brand campaigns that increased online visibility by 40%",
    "Developed and executed social media strategies for high engagement",
    "Optimized digital ad campaigns resulting in higher ROI and lead generation"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
},
"Ebtasam Olama": {
  name: "Ebtasam Olama",
  role: "Digital Content & Social Media Specialist",
  expertise: "Content Strategy, Social Media Management & Digital Marketing",
  bio: "Ebtasam is a creative Digital Content & Social Media Specialist with expertise in developing engaging content strategies and managing online brand presence. She excels at crafting compelling posts, visuals, and campaigns that drive audience engagement and strengthen brand identity.",
  experience: "4+ years in digital content and social media management",
  education: ["BA in Media & Communication", "Digital Marketing Diploma"],
  certifications: ["Social Media Marketing Certification", "Google Analytics Certified"],
  projects: [
    "Managed and grew multiple social media accounts with increased engagement rates",
    "Created digital content strategies that boosted brand visibility",
    "Executed successful paid ad campaigns across social platforms"
  ],
  social: { linkedin: "#", github: "#", twitter: "#" }
},

"Ganna Mohy": {
  name: "Ganna Mohy",
  role: " Senior Content Creator",
  expertise: "Digital Content Creation, Social Media Strategy & Brand Storytelling",
  bio: "Ganna Mohy is a creative Content Creator specializing in developing engaging digital content, social media campaigns, and brand storytelling. She excels at creating compelling visuals and copy that boost online presence, drive audience engagement, and strengthen brand identity. With a passion for creativity and innovation, Ganna helps brands connect with their audiences in meaningful ways.",
  experience: "3+ years in content creation and social media management",
  education: [
    "BA in Media & Communication",
    "Digital Marketing Certification"
  ],
  certifications: [
    "Content Marketing Certified",
    "Social Media Strategy Certification",
    "Adobe Creative Suite Training"
  ],
  projects: [
    "Produced content for multiple successful digital campaigns",
    "Boosted social media engagement by 40% through creative strategies",
    "Developed brand storytelling materials for diverse industries"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
},

"Maiar Mohammed": {
  name: "Maiar Mohammed",
  role: "Testing Engineer",
  expertise: "Software Testing, Quality Assurance & Test Automation",
  bio: "Maiar Mohammed is a dedicated Testing Engineer with expertise in ensuring the quality and reliability of software applications. She specializes in manual and automated testing, identifying bugs, and improving system performance to deliver flawless user experiences. With strong attention to detail and a passion for problem-solving, Maiar plays a key role in maintaining high software standards.",
  experience: "4+ years in software testing and quality assurance",
  education: [
    "BS in Computer Engineering",
    "Quality Assurance & Testing Certification"
  ],
  certifications: [
    "ISTQB Certified Tester",
    "Selenium WebDriver Certification",
    "Agile Testing Certification"
  ],
  projects: [
    "Performed end-to-end testing for 15+ software applications",
    "Implemented automated test scripts to reduce testing time by 30%",
    "Collaborated with developers to improve overall software quality"
  ],
  social: {
    "linkedin": "#",
    "github": "#",
    "twitter": "#"
  }
}
  }


  // Technology details
  const technologyDetails: Record<string, any> = {
    React: {
      name: "React",
      description: "A JavaScript library for building user interfaces with component-based architecture",
      category: "Frontend Framework",
      useCases: ["Single Page Applications", "Progressive Web Apps", "Mobile Apps with React Native"],
      benefits: ["Virtual DOM for performance", "Component reusability", "Large ecosystem"],
    },
    "Next.js": {
      name: "Next.js",
      description: "The React framework for production with server-side rendering and static site generation",
      category: "Full-Stack Framework",
      useCases: ["E-commerce platforms", "Corporate websites", "SaaS applications"],
      benefits: ["SEO optimization", "Performance optimization", "API routes"],
    },
    "Node.js": {
      name: "Node.js",
      description: "JavaScript runtime built on Chrome's V8 engine for server-side development",
      category: "Backend Runtime",
      useCases: ["REST APIs", "Real-time applications", "Microservices"],
      benefits: ["High performance", "Scalable", "Large package ecosystem"],
    },
    Python: {
      name: "Python",
      description: "High-level programming language perfect for AI, data science, and web development",
      category: "Programming Language",
      useCases: ["Machine Learning", "Data Analysis", "Web Development", "Automation"],
      benefits: ["Easy to learn", "Extensive libraries", "Versatile applications"],
    },
    AWS: {
      name: "Amazon Web Services",
      description: "Comprehensive cloud computing platform offering 200+ services",
      category: "Cloud Platform",
      useCases: ["Web hosting", "Data storage", "Machine learning", "IoT"],
      benefits: ["Global infrastructure", "Pay-as-you-go", "Enterprise security"],
    },
    Docker: {
      name: "Docker",
      description: "Platform for developing, shipping, and running applications in containers",
      category: "Containerization",
      useCases: ["Application deployment", "Microservices", "Development environments"],
      benefits: ["Consistent environments", "Resource efficiency", "Easy scaling"],
    },
    "Adobe Creative Suite": {
      name: "Adobe Creative Suite",
      description: "Comprehensive collection of creative software for design, video editing, and digital content creation",
      category: "Creative Software",
      useCases: ["Video Production", "Graphic Design", "Motion Graphics", "Photo Editing"],
      benefits: ["Industry standard tools", "Seamless integration", "Professional quality output"],
    },
    "DaVinci Resolve": {
      name: "DaVinci Resolve",
      description: "Professional video editing and color grading software used in Hollywood productions",
      category: "Video Editing",
      useCases: ["Feature Films", "Commercial Videos", "Documentaries", "Music Videos"],
      benefits: ["Professional color grading", "Advanced editing tools", "Free version available"],
    },
    "Cinema 4D": {
      name: "Cinema 4D",
      description: "Professional 3D modeling, animation, and rendering software for motion graphics and visual effects",
      category: "3D Animation",
      useCases: ["Motion Graphics", "Visual Effects", "Product Visualization", "Broadcast Graphics"],
      benefits: ["User-friendly interface", "Powerful rendering", "Industry integration"],
    },
  }

  // Stat details
  const statDetails: Record<string, StatDetail> = {
    "500+": {
      number: "500+",
      label: "Projects Delivered",
      icon: Target,
      details:
        "Successfully completed 500+ projects across various industries including fintech, healthcare, e-commerce, enterprise solutions, and media production.",
      metrics: ["95% On-time delivery", "98% Client satisfaction", "Zero critical bugs in production"],
      achievements: [
        "Delivered projects in 25+ countries",
        "Worked with Fortune 500 companies",
        "Built solutions serving 50M+ users",
      ],
    },
    "98%": {
      number: "98%",
      label: "Client Satisfaction",
      icon: Award,
      details:
        "Maintained 98% client satisfaction rate with continuous support, timely delivery, and exceptional quality standards.",
      metrics: ["4.9/5 average rating", "95% repeat clients", "24/7 support response"],
      achievements: [
        "Industry-leading satisfaction rate",
        "Long-term partnerships with 80% of clients",
        "Award-winning customer service",
      ],
    },
    "50+": {
      number: "50+",
      label: "Expert Team",
      icon: Users,
      details:
        "Our diverse team of 50+ experts includes senior developers, designers, AI specialists, digital marketing professionals, and media production specialists.",
      metrics: ["15+ years average experience", "20+ certifications per member", "Multilingual support"],
      achievements: [
        "Team members from top tech companies",
        "Published 100+ technical articles",
        "Speakers at major tech conferences",
      ],
    },
    "24/7": {
      number: "24/7",
      label: "Support Available",
      icon: Shield,
      details:
        "Round-the-clock technical support and maintenance services to ensure your digital empire runs smoothly.",
      metrics: ["<2 min response time", "99.9% uptime guarantee", "Global support coverage"],
      achievements: [
        "24/7 monitoring and alerting",
        "Proactive maintenance and updates",
        "Emergency response team available",
      ],
    },
  }

  // Updated testimonial details with your specific clients
  const testimonialDetails: Record<string, TestimonialDetail> = {
    "Beauty Bar": {
      name: "Ahmed Mohamed",
      role: "Owner",
      company: "Beauty Bar",
      content:
        "The new website looks extremely luxurious and helped increase sales significantly. The advanced filtering and elegant product presentation made the customer experience outstanding. Thank you for the professional work.",
      rating: 5,
      image: "", // Remove image reference
      results: ["Increased Sales Significantly", "Luxurious Brand Presentation", "Outstanding Customer Experience"],
      projectType: "Shopify E-commerce for High-End Beauty Brands",
      duration: "12 weeks",
      satisfaction: "Exceeded expectations",
    },
    "CourierX Egypt": {
      name: "Marina Mazhar",
      role: "Operations Manager",
      company: "CourierX Egypt",
      content:
        "We worked with the team on a fully integrated courier platform. Everything was precise: real-time tracking, an easy dashboard, and a smart dispatch system. They truly transformed how we work.",
      rating: 5,
      image: "", // Remove image reference
      results: ["Real-time Tracking System", "Smart Dispatch Integration", "Operational Transformation"],
      projectType: "Integrated Courier Platform Website",
      duration: "20 weeks",
      satisfaction: "Transformational results",
    },
    "Hollywood Clinic": {
      name: "Dr. Sara",
      role: "Medical Director",
      company: "Hollywood Clinic",
      content:
        "The platform built for our clinic made managing appointments and patients much easier. The app is fast, easy to use, and medically compliant. An excellent experience with a professional team.",
      rating: 5,
      image: "", // Remove image reference
      results: ["Streamlined Patient Management", "Medical Compliance Achieved", "Enhanced User Experience"],
      projectType: "Flutter Clinic Management System with Backend",
      duration: "16 weeks",
      satisfaction: "Excellent professional experience",
    },
    "TechCorp Media": {
      name: "Sarah Ahmed",
      role: "Marketing Director",
      company: "TechCorp Media",
      content:
        "The media production team delivered exceptional quality content that perfectly represents our brand. The videos have significantly improved our corporate image and customer engagement across all platforms.",
      rating: 5,
      image: "", // Remove image reference
      results: ["Enhanced Brand Perception", "Increased Social Media Engagement", "Professional Corporate Presentation"],
      projectType: "Corporate Brand Video Campaign",
      duration: "8 weeks",
      satisfaction: "Outstanding quality and creativity",
    },
  }

  // Insight details
  
  // Handle page load
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Handle scroll to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      Object.entries(sectionRefs).forEach(([section, ref]) => {
        if (ref.current) {
          const element = ref.current
          const offsetTop = element.offsetTop
          const height = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
            setActiveSection(section)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle keyboard events for modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isFeedbackModalOpen) {
          closeFeedbackModal()
        } else if (activeModal) {
          closeModal()
        } else if (activePolicy) {
          closePolicy()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFeedbackModalOpen, activeModal, activePolicy])

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs[sectionId as keyof typeof sectionRefs]?.current
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      })
    }
    setIsMenuOpen(false)
  }

  // Handle modal opening
  const openModal = (modalType: string, data?: any) => {
    setActiveModal(modalType)
    setModalData(data)
    document.body.style.overflow = "hidden"
  }

  // Handle modal closing
  const closeModal = () => {
    setActiveModal(null)
    setModalData(null)
    document.body.style.overflow = "unset"
  }

  // Handle feedback modal
  const openFeedbackModal = () => {
    setIsFeedbackModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false)
    setFeedbackData({ name: "", email: "", rating: 0, feedback: "" })
    setFeedbackErrors({})
    document.body.style.overflow = "unset"
  }

  // Handle video modal
  const handleVideoPlay = () => {
    setIsVideoPlaying(true)
    document.body.style.overflow = "hidden"
  }

  const handleCloseVideo = () => {
    setIsVideoPlaying(false)
    document.body.style.overflow = "unset"
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {}

    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }
    if (!formData.message.trim()) errors.message = "Message is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Send email to info@starsolution.ai
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          to: "info@starsolution.ai",
        }),
      })

      if (response.ok) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you within 24 hours.",
          duration: 5000,
        })

        setFormData({
          name: "",
          email: "",
          company: "",
          budget: "",
          message: "",
        })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle feedback form submission
  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate feedback form
    const errors: Record<string, string> = {}
    if (!feedbackData.name.trim()) errors.name = "Name is required"
    if (!feedbackData.email.trim()) errors.email = "Email is required"
    if (!feedbackData.email.includes("@")) errors.email = "Please enter a valid email"
    if (feedbackData.rating === 0) errors.rating = "Please select a rating"
    if (!feedbackData.feedback.trim()) errors.feedback = "Feedback is required"

    setFeedbackErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)

    try {
      // Send feedback email to info@starsolution.ai
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: feedbackData.name,
          email: feedbackData.email,
          message: `Feedback Rating: ${feedbackData.rating}/5 stars\n\nFeedback:\n${feedbackData.feedback}`,
          to: "info@starsolution.ai",
        }),
      })

      if (response.ok) {
        toast({
          title: "Feedback sent successfully!",
          description: "Thank you for your valuable feedback. We appreciate it!",
          duration: 5000,
        })
        // Close modal after a short delay to show the success message
        setTimeout(() => {
          closeFeedbackModal()
        }, 1000)
      } else {
        throw new Error("Failed to send feedback")
      }
    } catch (error) {
      toast({
        title: "Error sending feedback",
        description: "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const codeAnimationVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 via-blue-950 to-slate-950 text-white overflow-x-hidden relative">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Toast notifications */}
      <Toaster />


      {/* Enhanced Floating Code Elements with More Animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[
          { icon: Terminal, delay: 0, color: "text-cyan-400/30" },
          { icon: Code2, delay: 0.5, color: "text-purple-400/30" },
          { icon: Monitor, delay: 1, color: "text-pink-400/30" },
          { icon: Database, delay: 1.5, color: "text-blue-400/30" },
          { icon: Cloud, delay: 2, color: "text-green-400/30" },
          { icon: Cpu, delay: 2.5, color: "text-orange-400/30" },
          { icon: Server, delay: 3, color: "text-red-400/30" },
          { icon: GitBranch, delay: 3.5, color: "text-yellow-400/30" },
          { icon: Package, delay: 4, color: "text-indigo-400/30" },
          { icon: Layers, delay: 4.5, color: "text-teal-400/30" },
          { icon: Activity, delay: 5, color: "text-lime-400/30" },
          { icon: BarChart3, delay: 5.5, color: "text-rose-400/30" },
          { icon: Laptop, delay: 6, color: "text-violet-400/30" },
          { icon: Smartphone, delay: 6.5, color: "text-emerald-400/30" },
          { icon: Tablet, delay: 7, color: "text-amber-400/30" },
          { icon: Video, delay: 7.5, color: "text-red-400/30" },
          { icon: Camera, delay: 8, color: "text-pink-400/30" },
          { icon: Mic, delay: 8.5, color: "text-orange-400/30" },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.color}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, 50, -30, 0],
              rotate: [0, 360, -180, 0],
              scale: [0.5, 1.2, 0.8, 1],
              opacity: [0.1, 0.6, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Number.POSITIVE_INFINITY,
              delay: item.delay,
              ease: "easeInOut",
            }}
          >
            <item.icon className="w-12 h-12" />
          </motion.div>
        ))}
      </div>

      {/* Floating Binary Code Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-400/20 font-mono text-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200],
              opacity: [0, 1, 0],
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={handleCloseVideo}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <Button
                  onClick={handleCloseVideo}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h3 className="text-xl font-bold text-white">Star Solutions Demo</h3>
                <div className="w-16" />
              </div>
              <div className="aspect-video bg-slate-800 flex items-center justify-center">
                <div className="text-center p-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Terminal className="w-20 h-20 mx-auto mb-6 text-cyan-400" />
                  </motion.div>
                  <h4 className="text-2xl font-bold mb-4 text-white">Interactive Development Showcase</h4>
                  <p className="text-gray-300 mb-6 text-lg">
                    Watch our development process in action - from concept to deployment
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2 text-cyan-400">Live Coding Sessions:</h5>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Real-time development</li>
                        <li>• Code architecture walkthrough</li>
                        <li>• Best practices demonstration</li>
                        <li>• Problem-solving techniques</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2 text-purple-400">Technologies Featured:</h5>
                      <ul className="text-gray-300 space-y-1">
                        <li>• React & Next.js development</li>
                        <li>• Node.js backend creation</li>
                        <li>• Database design & optimization</li>
                        <li>• Cloud deployment strategies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Modal System */}
      <AnimatePresence>
        {activeModal && modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-start md:items-center justify-center p-0 md:p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full h-full md:h-auto md:max-h-[95vh] max-w-6xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 md:rounded-2xl overflow-hidden md:my-4 border-0 md:border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Sticky on mobile */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-xl">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Back</span>
                </Button>
                <div className="text-center flex-1 px-2">
                  <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent truncate">
                    {modalData.title || modalData.name || "Details"}
                  </h2>
                  {modalData.category && (
                    <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 mt-1 text-xs">
                      {modalData.category}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 md:hidden"
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="w-16 hidden md:block" />
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)] md:max-h-[75vh]">
                {/* Service Modal */}
                {activeModal === "service" && (
                  <div className="space-y-6 md:space-y-8">
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">{modalData.description}</p>

                    {/* Stats Cards with Charts */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-4 md:p-5 rounded-xl border border-cyan-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                          <span className="text-xs text-cyan-300">ROI</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-white">+150%</p>
                        <p className="text-xs text-gray-400 mt-1">Avg. increase</p>
                        {/* Mini bar chart */}
                        <div className="flex items-end gap-1 mt-3 h-8">
                          {[40, 55, 45, 70, 85, 95].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                              className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t"
                            />
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 md:p-5 rounded-xl border border-purple-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                          <span className="text-xs text-purple-300">Clients</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-white">50+</p>
                        <p className="text-xs text-gray-400 mt-1">Happy clients</p>
                        {/* Circular progress */}
                        <div className="relative w-10 h-10 mx-auto mt-2">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="4" />
                            <motion.circle
                              cx="20" cy="20" r="16" fill="none" stroke="url(#purpleGrad)" strokeWidth="4"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0 100" }}
                              animate={{ strokeDasharray: "85 100" }}
                              transition={{ delay: 0.3, duration: 1 }}
                            />
                            <defs>
                              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#ec4899" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">85%</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-4 md:p-5 rounded-xl border border-green-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                          <span className="text-xs text-green-300">Success</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-white">98%</p>
                        <p className="text-xs text-gray-400 mt-1">Satisfaction rate</p>
                        {/* Horizontal progress bars */}
                        <div className="space-y-1 mt-3">
                          {[95, 98, 92].map((w, i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 bg-green-900/30 rounded-full overflow-hidden"
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${w}%` }}
                                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-4 md:p-5 rounded-xl border border-orange-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                          <span className="text-xs text-orange-300">Timeline</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white">{modalData.timeline}</p>
                        <p className="text-xs text-gray-400 mt-1">Delivery time</p>
                        {/* Timeline dots */}
                        <div className="flex items-center justify-between mt-3">
                          {[1, 2, 3, 4].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              className={`w-2.5 h-2.5 rounded-full ${i < 3 ? 'bg-orange-400' : 'bg-orange-400/30'}`}
                            />
                          ))}
                        </div>
                        <div className="h-0.5 bg-gradient-to-r from-orange-400 via-orange-400 to-orange-400/30 rounded-full mt-1" />
                      </motion.div>
                    </div>

                    {/* Features with Progress Visualization */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-white">
                            <Settings className="w-5 h-5 md:w-6 md:h-6 mr-2 text-cyan-400" />
                            Key Features
                          </h3>
                          <div className="space-y-3">
                            {modalData.features.map((feature: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                              >
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                  onClick={() =>
                                    toast({
                                      title: feature,
                                      description: "Feature details would be shown in a real implementation.",
                                      duration: 3000,
                                    })
                                  }
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                                    <span className="text-gray-200 text-sm md:text-base truncate">{feature}</span>
                                  </div>
                                  <span className="text-xs text-cyan-400 ml-2">✓</span>
                                </div>
                                {/* Feature progress bar */}
                                <motion.div
                                  className="h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent rounded-full mt-1"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${85 + index * 2}%` }}
                                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-white">
                            <Code className="w-5 h-5 md:w-6 md:h-6 mr-2 text-purple-400" />
                            Technologies Used
                          </h3>
                          {/* Tech Stack Visualization */}
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex flex-wrap gap-2">
                              {modalData.technologies.map((tech: string, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ scale: 0, rotate: -10 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: index * 0.1, type: "spring" as const }}
                                >
                                  <Badge
                                    className="bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-white border-purple-500/30 cursor-pointer hover:bg-purple-500/40 transition-all hover:scale-105 text-xs md:text-sm py-1.5 px-3"
                                    onClick={() =>
                                      openModal(
                                        "technology",
                                        technologyDetails[tech] || {
                                          name: tech,
                                          description: `Learn more about ${tech}`,
                                        },
                                      )
                                    }
                                  >
                                    {tech}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                            {/* Tech distribution bar */}
                            <div className="mt-4 flex rounded-full overflow-hidden h-2">
                              {modalData.technologies.slice(0, 5).map((_: string, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${100 / Math.min(modalData.technologies.length, 5)}%` }}
                                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                                  className={`h-full ${
                                    ['bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500'][index]
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-white">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 mr-2 text-pink-400" />
                            Our Process
                          </h3>
                          {/* Process Timeline */}
                          <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-4 md:left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500" />
                            <div className="space-y-3">
                              {modalData.process.map((step: string, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ x: 20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.15 }}
                                  className="relative flex items-start pl-10 md:pl-12"
                                >
                                  {/* Step number circle */}
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.15 + 0.1, type: "spring" }}
                                    className="absolute left-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-lg shadow-purple-500/30"
                                  >
                                    {index + 1}
                                  </motion.div>
                                  <div
                                    className="flex-1 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() =>
                                      toast({
                                        title: `Step ${index + 1}`,
                                        description: step,
                                        duration: 3000,
                                      })
                                    }
                                  >
                                    <span className="text-gray-200 text-sm md:text-base">{step}</span>
                                    {/* Step progress indicator */}
                                    <div className="flex gap-1 mt-2">
                                      {[1, 2, 3].map((_, i) => (
                                        <motion.div
                                          key={i}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: index * 0.15 + i * 0.1 }}
                                          className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 to-cyan-500/50 rounded-full"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-white">
                            <Award className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-400" />
                            Benefits
                          </h3>
                          {/* Benefits with metrics */}
                          <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {modalData.benefits.map((benefit: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1, type: "spring" as const }}
                                whileHover={{ scale: 1.02 }}
                                className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20 cursor-pointer hover:border-yellow-500/40 transition-all"
                                onClick={() =>
                                  toast({
                                    title: benefit,
                                    description: "Benefit details would be shown in a real implementation.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <div className="flex items-start gap-2">
                                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs md:text-sm text-gray-200 leading-tight">{benefit}</span>
                                </div>
                                {/* Benefit metric bar */}
                                <motion.div
                                  className="h-1 bg-yellow-900/30 rounded-full mt-2 overflow-hidden"
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${75 + index * 4}%` }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
                                  />
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 py-6 text-base md:text-lg font-semibold shadow-lg shadow-purple-500/25"
                        onClick={() => {
                          closeModal()
                          scrollToSection("contact")
                        }}
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Get Started Today
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 py-6"
                        onClick={() => {
                          closeModal()
                          scrollToSection("portfolio")
                        }}
                      >
                        View Our Work
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Portfolio Modal */}
                {activeModal === "portfolio" && (
                  <div className="space-y-6">
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">{modalData.description}</p>

                    {/* Project Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-4 rounded-xl border border-cyan-500/20 text-center"
                      >
                        <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-xl md:text-2xl font-bold text-white">{modalData.timeline}</p>
                        <p className="text-xs text-gray-400">Duration</p>
                      </motion.div>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-4 rounded-xl border border-green-500/20 text-center"
                      >
                        <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-xl md:text-2xl font-bold text-white">{modalData.results?.length || 5}+</p>
                        <p className="text-xs text-gray-400">Results</p>
                      </motion.div>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 rounded-xl border border-purple-500/20 text-center"
                      >
                        <Code className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-xl md:text-2xl font-bold text-white">{modalData.technologies?.length || 6}</p>
                        <p className="text-xs text-gray-400">Technologies</p>
                      </motion.div>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-4 rounded-xl border border-yellow-500/20 text-center"
                      >
                        <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-xl md:text-2xl font-bold text-white">5.0</p>
                        <p className="text-xs text-gray-400">Rating</p>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-4 md:space-y-6">
                        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-4 md:p-5 rounded-xl border border-red-500/20">
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-red-400 flex items-center">
                            <Target className="w-5 h-5 mr-2" />
                            The Challenge
                          </h3>
                          <p className="text-gray-300 text-sm md:text-base leading-relaxed">{modalData.challenge}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 md:p-5 rounded-xl border border-green-500/20">
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-green-400 flex items-center">
                            <Lightbulb className="w-5 h-5 mr-2" />
                            Our Solution
                          </h3>
                          <p className="text-gray-300 text-sm md:text-base leading-relaxed">{modalData.solution}</p>
                        </div>

                        <div>
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-blue-400 flex items-center">
                            <Code className="w-5 h-5 mr-2" />
                            Technologies Used
                          </h3>
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex flex-wrap gap-2">
                              {modalData.technologies.map((tech: string, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Badge
                                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-blue-500/30 cursor-pointer hover:bg-blue-500/40 transition-all hover:scale-105 text-xs md:text-sm py-1.5 px-3"
                                    onClick={() =>
                                      openModal(
                                        "technology",
                                        technologyDetails[tech] || {
                                          name: tech,
                                          description: `Learn more about ${tech}`,
                                        },
                                      )
                                    }
                                  >
                                    {tech}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                            {/* Tech Stack Distribution */}
                            <div className="mt-4 flex rounded-full overflow-hidden h-2">
                              {modalData.technologies.slice(0, 6).map((_: string, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${100 / Math.min(modalData.technologies.length, 6)}%` }}
                                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                                  className={`h-full ${
                                    ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-green-500'][index]
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-yellow-400 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Results Achieved
                          </h3>
                          <div className="space-y-3">
                            {modalData.results.map((result: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                              >
                                <div
                                  className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                  onClick={() =>
                                    toast({
                                      title: "Result Details",
                                      description: result,
                                      duration: 3000,
                                    })
                                  }
                                >
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  </div>
                                  <span className="text-gray-200 text-sm md:text-base flex-1">{result}</span>
                                </div>
                                {/* Result progress bar */}
                                <motion.div
                                  className="h-1 bg-gradient-to-r from-green-500/30 to-transparent rounded-full mt-1 ml-11"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${90 - index * 5}%` }}
                                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Project Progress Chart */}
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h4 className="text-sm font-semibold text-white mb-3">Project Success Metrics</h4>
                          <div className="space-y-3">
                            {[
                              { label: "Client Satisfaction", value: 98 },
                              { label: "On-Time Delivery", value: 100 },
                              { label: "Budget Adherence", value: 95 },
                              { label: "Quality Score", value: 97 },
                            ].map((metric, index) => (
                              <div key={index}>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span>{metric.label}</span>
                                  <span className="text-cyan-400">{metric.value}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.value}%` }}
                                    transition={{ delay: 0.5 + index * 0.15, duration: 0.6 }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 md:p-5 rounded-xl border border-purple-500/20">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold mb-2 text-white">Client Testimonial</h3>
                              <blockquote className="text-gray-300 text-sm italic leading-relaxed">"{modalData.testimonial}"</blockquote>
                              <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 py-5 md:py-6 shadow-lg shadow-purple-500/25"
                        onClick={() => {
                          closeModal()
                          scrollToSection("contact")
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Similar Project
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 py-5 md:py-6"
                        onClick={closeModal}
                      >
                        Back to Portfolio
                      </Button>
                    </div>
                  </div>
                )}

                {/* Team Modal */}
                {activeModal === "team" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-4 md:space-y-6">
                        {/* Profile Header - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-white/10">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-white">{modalData.name}</h3>
                            <p className="text-cyan-400 text-lg md:text-xl mb-1">{modalData.role}</p>
                            <p className="text-gray-300 text-sm md:text-base">{modalData.expertise}</p>
                            {/* Social links */}
                            <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                              {modalData.social?.linkedin && (
                                <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500/30">
                                  <Linkedin className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                              {modalData.social?.github && (
                                <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500/30">
                                  <Github className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                              {modalData.social?.twitter && (
                                <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500/30">
                                  <Twitter className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-white flex items-center">
                            <Users className="w-5 h-5 mr-2 text-cyan-400" />
                            About
                          </h3>
                          <p className="text-gray-300 text-sm md:text-base leading-relaxed">{modalData.bio}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-white flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
                            Experience
                          </h3>
                          <p className="text-gray-300 text-sm md:text-base">{modalData.experience}</p>
                          {/* Experience visualization */}
                          <div className="mt-3 flex items-end gap-1 h-8">
                            {[30, 45, 60, 75, 90, 100].map((h, i) => (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                                className="flex-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-t"
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg md:text-xl font-bold mb-3 text-white flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2 text-yellow-400" />
                            Education
                          </h3>
                          <div className="space-y-2">
                            {modalData.education.map((edu: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() =>
                                  toast({
                                    title: "Education Details",
                                    description: edu,
                                    duration: 3000,
                                  })
                                }
                              >
                                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <GraduationCap className="w-4 h-4 text-yellow-400" />
                                </div>
                                <span className="text-sm text-gray-200">{edu}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-white">Certifications</h3>
                          <div className="space-y-2">
                            {modalData.certifications.map((cert: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center p-2 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() =>
                                  toast({
                                    title: "Certification Details",
                                    description: cert,
                                    duration: 3000,
                                  })
                                }
                              >
                                <Certificate className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-200">{cert}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-white">Key Projects</h3>
                          <div className="space-y-2">
                            {modalData.projects.map((project: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1, type: "spring" as const }}
                                className="flex items-center p-2 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() =>
                                  toast({
                                    title: "Project Details",
                                    description: project,
                                    duration: 3000,
                                  })
                                }
                              >
                                <Target className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-200">{project}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Technology Modal */}
                {activeModal === "technology" && (
                  <div>
                    <div className="mb-6">
                      <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30 mb-4">
                        {modalData.category}
                      </Badge>
                      <p className="text-gray-300 text-lg leading-relaxed">{modalData.description}</p>
                    </div>

                    {modalData.useCases && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-white">Use Cases</h3>
                        <div className="grid gap-2">
                          {modalData.useCases.map((useCase: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center p-2 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                              onClick={() =>
                                toast({
                                  title: "Use Case Details",
                                  description: useCase,
                                  duration: 3000,
                                })
                              }
                            >
                              <Target className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-200">{useCase}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {modalData.benefits && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-white">Key Benefits</h3>
                        <div className="grid gap-2">
                          {modalData.benefits.map((benefit: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1, type: "spring" as const }}
                              className="flex items-center p-2 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                              onClick={() =>
                                toast({
                                  title: "Benefit Details",
                                  description: benefit,
                                  duration: 3000,
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-200">{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8">
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        onClick={() => {
                          closeModal()
                          scrollToSection("contact")
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Discuss This Technology
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stat Modal */}
                {activeModal === "stat" && (
                  <div>
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <modalData.icon className="w-12 h-12 text-cyan-400" />
                      </motion.div>
                      <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        {modalData.number}
                      </h3>
                      <p className="text-xl text-gray-300">{modalData.label}</p>
                    </div>

                    <p className="text-gray-300 text-lg mb-8 leading-relaxed text-center">{modalData.details}</p>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-bold mb-4 text-white">Key Metrics</h4>
                        <div className="space-y-3">
                          {modalData.metrics.map((metric: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                              onClick={() =>
                                toast({
                                  title: "Metric Details",
                                  description: metric,
                                  duration: 3000,
                                })
                              }
                            >
                              <BarChart3 className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                              <span className="text-gray-200">{metric}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold mb-4 text-white">Achievements</h4>
                        <div className="space-y-3">
                          {modalData.achievements.map((achievement: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                              onClick={() =>
                                toast({
                                  title: "Achievement Details",
                                  description: achievement,
                                  duration: 3000,
                                })
                              }
                            >
                              <Trophy className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                              <span className="text-gray-200">{achievement}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Testimonial Modal */}
                {activeModal === "testimonial" && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mr-6">
                        <Users className="w-10 h-10 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1 text-white">{modalData.name}</h3>
                        <p className="text-cyan-400 text-lg mb-1">{modalData.role}</p>
                        <p className="text-gray-300">{modalData.company}</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xl font-bold mb-4 text-white">Client Testimonial</h4>
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-lg border border-purple-500/20">
                            <div className="flex mb-4">
                              {[...Array(modalData.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <blockquote className="text-gray-300 italic text-lg leading-relaxed">
                              "{modalData.content}"
                            </blockquote>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xl font-bold mb-4 text-white">Project Results</h4>
                          <div className="space-y-3">
                            {modalData.results.map((result: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() =>
                                  toast({
                                    title: "Result Details",
                                    description: result,
                                    duration: 3000,
                                  })
                                }
                              >
                                <TrendingUp className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                                <span className="text-gray-200">{result}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/5 p-4 rounded-lg cursor-pointer"
                            onClick={() =>
                              toast({
                                title: "Project Type",
                                description: modalData.projectType,
                                duration: 3000,
                              })
                            }
                          >
                            <div className="flex items-center mb-2">
                              <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
                              <h5 className="font-semibold text-white">Project Type</h5>
                            </div>
                            <p className="text-blue-400 font-medium">{modalData.projectType}</p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/5 p-4 rounded-lg cursor-pointer"
                            onClick={() =>
                              toast({
                                title: "Project Duration",
                                description: `Project completed in ${modalData.duration}`,
                                duration: 3000,
                              })
                            }
                          >
                            <div className="flex items-center mb-2">
                              <Clock className="w-5 h-5 text-green-400 mr-2" />
                              <h5 className="font-semibold text-white">Duration</h5>
                            </div>
                            <p className="text-green-400 font-medium">{modalData.duration}</p>
                          </motion.div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="bg-white/5 p-6 rounded-lg cursor-pointer"
                          onClick={() =>
                            toast({
                              title: "Client Satisfaction",
                              description: modalData.satisfaction,
                              duration: 3000,
                            })
                          }
                        >
                          <div className="flex items-center mb-2">
                            <Heart className="w-5 h-5 text-red-400 mr-2" />
                            <h5 className="font-semibold text-white">Client Satisfaction</h5>
                          </div>
                          <p className="text-red-400 font-medium">{modalData.satisfaction}</p>
                        </motion.div>

                        <div>
                          <h4 className="text-xl font-bold mb-4 text-white">Connect with Client</h4>
                          <div className="flex space-x-4">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                onClick={() =>
                                  toast({
                                    title: "Contact Client",
                                    description: "Client contact would be available in a real implementation.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                onClick={() =>
                                  toast({
                                    title: "View Case Study",
                                    description: "Full case study would be shown in a real implementation.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Case Study
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insight Modal */}
                {activeModal === "insight" && (
                  <div>
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
                          {modalData.category}
                        </Badge>
                        <div className="text-gray-400 text-sm">{modalData.date}</div>
                      </div>
                      <div className="flex items-center mb-4">
                        <div className="text-gray-300 mr-4">By {modalData.author}</div>
                        <div className="text-gray-400 text-sm">{modalData.readTime}</div>
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed">{modalData.description}</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <h4 className="text-xl font-bold mb-4 text-white">Article Content</h4>
                        <div className="bg-white/5 p-6 rounded-lg">
                          <p className="text-gray-300 leading-relaxed">{modalData.content}</p>
                        </div>

                        <div className="mt-6">
                          <h4 className="text-xl font-bold mb-4 text-white">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {modalData.tags.map((tag: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1, type: "spring" as const }}
                              >
                                <Badge
                                  className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-blue-500/30 cursor-pointer hover:bg-blue-500/30 transition-colors"
                                  onClick={() =>
                                    toast({
                                      title: `Tag: ${tag}`,
                                      description: "Related articles would be shown in a real implementation.",
                                      duration: 3000,
                                    })
                                  }
                                >
                                  {tag}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold mb-4 text-white">Related Topics</h4>
                        <div className="space-y-3">
                          {modalData.relatedTopics.map((topic: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                              onClick={() =>
                                toast({
                                  title: "Related Topic",
                                  description: `Learn more about ${topic}`,
                                  duration: 3000,
                                })
                              }
                            >
                              <div className="flex items-center">
                                <Lightbulb className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-200 text-sm">{topic}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-6">
                          <h4 className="text-xl font-bold mb-4 text-white">Share Article</h4>
                          <div className="flex space-x-3">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                onClick={() =>
                                  toast({
                                    title: "Share on LinkedIn",
                                    description: "Article would be shared on LinkedIn in a real implementation.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <Linkedin className="w-4 h-4" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                onClick={() =>
                                  toast({
                                    title: "Share on Twitter",
                                    description: "Article would be shared on Twitter in a real implementation.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <Twitter className="w-4 h-4" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                onClick={() =>
                                  toast({
                                    title: "Bookmark Article",
                                    description: "Article would be bookmarked in a real implementation.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Automation Flow Modal */}
                {activeModal === "automation" && modalData && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${modalData.color} flex items-center justify-center`}>
                        <modalData.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">{modalData.name}</h3>
                        <p className="text-sm text-gray-400">{modalData.description}</p>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {Object.entries(modalData.stats).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1, type: "spring" }}
                          className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/20 text-center"
                        >
                          <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{String(value)}</p>
                          <p className="text-[10px] text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Flow Diagram */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <GitBranch className="w-5 h-5 mr-2 text-purple-400" />
                        Automation Flow
                      </h4>
                      <div className="relative">
                        {/* Flow Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 opacity-30" />
                        
                        <div className="space-y-4">
                          {modalData.flows.map((flow: any, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.2 }}
                              className="relative flex items-start gap-4"
                            >
                              {/* Step Number Circle */}
                              <div className="relative z-10 flex-shrink-0">
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${modalData.color} flex items-center justify-center border-2 border-white/20 shadow-lg`}
                                >
                                  <flow.icon className="w-6 h-6 text-white" />
                                </motion.div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                                  <span className="text-[10px] font-bold text-white">{flow.step}</span>
                                </div>
                              </div>

                              {/* Content Card */}
                              <motion.div
                                whileHover={{ x: 5 }}
                                className="flex-1 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-all"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-semibold text-white">{flow.title}</h5>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                                    {flow.metrics}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400">{flow.desc}</p>
                                
                                {/* Progress bar */}
                                <motion.div
                                  className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(flow.step / modalData.flows.length) * 100}%` }}
                                    transition={{ delay: index * 0.3 + 0.5, duration: 0.6 }}
                                    className={`h-full bg-gradient-to-r ${modalData.color} rounded-full`}
                                  />
                                </motion.div>
                              </motion.div>

                              {/* Arrow */}
                              {index < modalData.flows.length - 1 && (
                                <motion.div
                                  animate={{ y: [0, 5, 0] }}
                                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                                  className="absolute left-[46px] top-12 text-purple-400"
                                >
                                  ↓
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Performance Graph */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/20">
                      <h4 className="text-sm font-semibold text-white mb-3">Performance Metrics</h4>
                      <div className="space-y-3">
                        {Object.entries(modalData.stats).map(([key, value], index) => {
                          const percentage = typeof value === 'string' 
                            ? parseInt(value.replace(/[^0-9]/g, '')) || 50 
                            : 50;
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-purple-400 font-semibold">{String(value)}</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ delay: index * 0.1 + 0.8, duration: 0.8 }}
                                  className={`h-full bg-gradient-to-r ${modalData.color} rounded-full`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${modalData.color} hover:brightness-110 text-white font-semibold py-5 rounded-xl`}
                      onClick={() => {
                        closeModal();
                        scrollToSection("contact");
                      }}
                    >
                      Get This Automation
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" as const }}
        className="fixed top-0 w-full z-40 backdrop-blur-2xl bg-gradient-to-r from-slate-950/80 via-purple-950/60 to-slate-950/80 border-b border-white/10 shadow-2xl shadow-purple-500/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Star className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Star Solutions
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                { name: "Home", href: "home" },
                { name: "Services", href: "services" },
                { name: "Solutions", href: "solutions" },
                { name: "Team", href: "team" },
                { name: "Insights", href: "insights" },
                { name: "Contact", href: "contact" },
              ].map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative text-gray-300 hover:text-white transition-all duration-300 ${
                    activeSection === item.href ? "text-cyan-400" : ""
                  }`}
                >
                  {item.name}
                  {activeSection === item.href && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"
                    />
                  )}
                </motion.button>
              ))}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-lg shadow-purple-500/25"
                  onClick={() => scrollToSection("contact")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg bg-white/5 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden mt-4 pb-4 space-y-4 border-t border-white/10 pt-4"
              >
                {[
                  { name: "Home", href: "home" },
                  { name: "Services", href: "services" },
                  { name: "Solutions", href: "solutions" },
                  { name: "Team", href: "team" },
                  { name: "Insights", href: "insights" },
                  { name: "Contact", href: "contact" },
                ].map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`block text-left w-full text-gray-300 hover:text-white transition-colors py-2 ${
                      activeSection === item.href ? "text-cyan-400" : ""
                    }`}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={sectionRefs.home}
        id="home"
        className="relative pt-14 pb-0 md:pt-28 md:pb-16 overflow-hidden min-h-[70vh] md:min-h-[85vh] flex items-center"
      >
        {/* Enhanced Background gradient with animated elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-blue-900/20 via-transparent to-transparent" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <motion.div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full flex flex-col items-center">
          {/* Decorative elements - hidden on mobile to save space */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
          />

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-2 md:mb-4"
          >
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1.5 md:mr-2 inline" />
              Award-Winning Digital Solutions
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-extrabold mb-1.5 md:mb-4 leading-tight w-full"
          >
            <span className="block mb-1 md:mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                We Build
              </span>
            </span>
            <span className="block">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 via-cyan-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Digital Empire
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm md:text-lg lg:text-xl text-gray-300 mb-2 md:mb-4 max-w-2xl mx-auto leading-relaxed w-full"
          >
            Transform your business with{" "}
            <span className="text-cyan-400 font-semibold">cutting-edge</span> software solutions,{" "}
            <span className="text-purple-400 font-semibold">innovative</span> automation, and{" "}
            <span className="text-pink-400 font-semibold">world-class</span> digital experiences
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center items-center mb-2 md:mb-6 w-full sm:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-sm md:text-base lg:text-lg px-6 py-4 md:px-8 md:py-6 rounded-xl md:rounded-2xl shadow-2xl shadow-purple-500/50 font-semibold relative overflow-hidden group w-full sm:w-auto"
                onClick={() => scrollToSection("contact")}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <Rocket className="mr-2 w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                Launch Your Project
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-sm md:text-base lg:text-lg px-6 py-4 md:px-8 md:py-6 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-sm font-semibold group w-full sm:w-auto"
                onClick={handleVideoPlay}
              >
                <Play className="mr-2 w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Compact Stats - 2x2 grid on mobile */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 gap-1.5 md:gap-2 w-full max-w-xs mx-auto mb-0"
          >
            {Object.entries(statDetails).map(([key, stat], index) => (
              <div
                key={index}
                className="text-center py-2 px-3 rounded-lg bg-white/5 border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-all"
                onClick={() => openModal("stat", stat)}
              >
                <div className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-[10px]">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll Indicator - compact - hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:flex items-center justify-center gap-2 text-gray-500 text-xs mt-2"
          >
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              ↓
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Button - Book Your Meeting */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="pt-1 pb-2 md:pt-2 md:pb-4 text-center bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20"
      >
        <Button
          className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-xs md:text-sm lg:text-base px-5 py-2.5 md:px-7 md:py-3.5 rounded-lg md:rounded-xl shadow-lg shadow-purple-500/50 font-semibold"
          onClick={() => scrollToSection("contact")}
        >
          <Calendar className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          Book Your Meeting
          <ArrowRight className="ml-1.5 md:ml-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </Button>
      </motion.div>

      {/* Enhanced Services Section */}
      <section ref={sectionRefs.services} id="services" className="pt-2 pb-4 md:pt-12 md:pb-16 lg:pt-16 lg:pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 via-purple-900/10 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-8xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-3 md:mb-8 lg:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-1.5 md:mb-4"
            >
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold">
                Our Expertise
              </Badge>
            </motion.div>
            <h2 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-extrabold mb-1.5 md:mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Premium Services
              </span>
            </h2>
            <p className="text-sm md:text-base lg:text-xl text-gray-400 max-w-2xl mx-auto px-2">
              Cutting-edge solutions tailored to elevate your digital presence
            </p>
          </motion.div>

          <div className="relative">
            <button
              aria-label="Previous"
              onClick={() => scrollHorizontally(servicesScrollRef, "left")}
              className="flex items-center justify-center absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 z-10"
            >
              <span className="sr-only">Previous</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-white"><path fillRule="evenodd" d="M15.78 3.72a.75.75 0 010 1.06L9.56 11l6.22 6.22a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
            </button>
            <div ref={servicesScrollRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
            {[
              {
                icon: ShoppingBag,
                title: "Shopify Websites",
                description:
                  "Complete Shopify store development, modifications, and optimization to skyrocket your e-commerce sales with stunning animations and revenue-boosting features",
                features: [
                  "Custom Shopify Store Development",
                  "Shopify Theme Modifications",
                  "Advanced Animations & Effects",
                  "Upselling & Cross-selling Systems",
                  "Revenue Optimization Strategies",
                  "Conversion-Boosting Features",
                ],
                color: "from-blue-500 to-purple-600",
                bgColor: "from-blue-500/20 to-purple-600/20",
                stats: { projects: "50+", growth: "+180%", clients: "98%" },
                chartData: [35, 45, 55, 70, 85, 95],
              },
              {
                icon: Server,
                title: "Business Systems",
                description:
                  "Custom-built software systems and SaaS solutions tailored for your industry - from logistics to healthcare to finance",
                features: [
                  "Courier & Delivery Systems",
                  "Accounting & Invoicing Systems",
                  "Medical & Healthcare SaaS",
                  "Inventory & Warehouse Management",
                  "Booking & Scheduling Platforms",
                  "Custom Industry Solutions",
                ],
                color: "from-purple-500 to-blue-600",
                bgColor: "from-purple-500/20 to-blue-600/20",
                stats: { projects: "30+", growth: "+250%", clients: "100%" },
                chartData: [40, 50, 45, 65, 80, 90],
              },
              {
                icon: Cpu,
                title: "Automations",
                description:
                  "Smart automation solutions that handle repetitive tasks, boost productivity, and let you focus on growing your business",
                features: [
                  "AI Chatbots & Support Bots",
                  "Automated Product Uploads",
                  "Inventory Auto-Sync",
                  "Order Processing Automation",
                  "Marketing & Email Automation",
                  "Custom Workflow Automations",
                ],
                color: "from-indigo-500 to-purple-600",
                bgColor: "from-indigo-500/20 to-purple-600/20",
                stats: { projects: "40+", growth: "+300%", clients: "95%" },
                chartData: [30, 55, 65, 75, 85, 100],
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group relative cursor-pointer w-[88vw] max-w-[360px] snap-center flex-shrink-0"
                onClick={() => {
                  const serviceData = serviceDetails[service.title];
                  if (serviceData) {
                    openModal("service", serviceData);
                  } else {
                    const fallbackServiceData = {
                      title: service.title,
                      description: service.description,
                      features: service.features,
                      technologies: [],
                      process: [],
                      timeline: "Contact us for timeline",
                      benefits: []
                    };
                    openModal("service", fallbackServiceData);
                  }
                }}
              >
                <Card className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-2 border-white/10 group-hover:border-purple-500/60 transition-all duration-500 h-full rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
                  {/* Enhanced Top Accent Line */}
                  <motion.div 
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${service.color}`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.8 }}
                  />
                  
                  {/* Animated glow effect */}
                  <motion.div
                    className={`absolute -inset-1 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                  />
                  
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                  
                  <CardContent className="p-4 md:p-6 relative z-10">
                    {/* Header with Icon and Stats */}
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${service.bgColor} rounded-xl flex items-center justify-center relative overflow-hidden border border-purple-500/30`}
                      >
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-30`}
                        />
                        <service.icon className="w-6 h-6 md:w-7 md:h-7 text-white relative z-10" />
                      </motion.div>
                      
                      {/* Mini Stats */}
                      <div className="flex gap-1.5">
                        <div className="text-center px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-[10px] md:text-xs font-bold text-blue-400">{service.stats.growth}</p>
                          <p className="text-[8px] text-gray-500">ROI</p>
                        </div>
                        <div className="text-center px-2 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <p className="text-[10px] md:text-xs font-bold text-purple-400">{service.stats.projects}</p>
                          <p className="text-[8px] text-gray-500">Projects</p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-4 leading-relaxed text-xs md:text-sm line-clamp-2">{service.description}</p>

                    {/* Animated Mini Chart */}
                    <div className="mb-4 p-3 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] md:text-xs text-gray-500">Performance Growth</span>
                        <span className={`text-[10px] md:text-xs font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>{service.stats.clients} Success</span>
                      </div>
                      <div className="flex items-end gap-1 h-10 md:h-12">
                        {service.chartData.map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 + 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                            className={`flex-1 bg-gradient-to-t ${service.color} rounded-t-sm md:rounded-t`}
                          />
                        ))}
                      </div>
                      {/* Chart baseline */}
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1 rounded-full" />
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 md:space-y-2 mb-4">
                      {service.features.slice(0, 4).map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + i * 0.08 }}
                          className="flex items-center text-gray-300 text-xs md:text-sm"
                        >
                          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r ${service.color} rounded-full mr-2 md:mr-3 flex-shrink-0`} />
                          <span className="flex-1 truncate">{feature}</span>
                        </motion.div>
                      ))}
                      {service.features.length > 4 && (
                        <p className="text-[10px] md:text-xs text-gray-500 ml-4 md:ml-5">+{service.features.length - 4} more features</p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${service.color} hover:brightness-110 text-white font-semibold py-4 md:py-5 rounded-xl text-sm md:text-base shadow-lg`}
                      onClick={(e) => {
                        e.stopPropagation()
                        const serviceData = serviceDetails[service.title];
                        if (serviceData) {
                          openModal("service", serviceData);
                        } else {
                          const fallbackServiceData = {
                            title: service.title,
                            description: service.description,
                            features: service.features,
                            technologies: [],
                            process: [],
                            timeline: "Contact us for timeline",
                            benefits: []
                          };
                          openModal("service", fallbackServiceData);
                        }
                      }}
                    >
                      <span className="flex items-center justify-center">
                        Explore Service
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
            <button
              aria-label="Next"
              onClick={() => scrollHorizontally(servicesScrollRef, "right")}
              className="flex items-center justify-center absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 z-10"
            >
              <span className="sr-only">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-white"><path fillRule="evenodd" d="M8.22 20.28a.75.75 0 010-1.06L14.44 13 8.22 6.78a.75.75 0 111.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 01-1.06 0z" clipRule="evenodd" /></svg>
            </button>
        </div>
        </div>
      </section>

      {/* CTA Button - Build Now */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="py-2 md:py-4 text-center bg-gradient-to-r from-purple-900/20 via-cyan-900/20 to-blue-900/20"
      >
        <Button
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-xs md:text-sm lg:text-base px-5 py-2.5 md:px-7 md:py-3.5 rounded-lg md:rounded-xl shadow-lg shadow-pink-500/50 font-semibold"
          onClick={() => scrollToSection("contact")}
        >
          <Zap className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          Build Now
          <ArrowRight className="ml-1.5 md:ml-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </Button>
      </motion.div>

      {/* Our Work Section */}
      <section ref={sectionRefs.solutions} id="solutions" className="pt-2 pb-4 md:pt-12 md:pb-16 lg:pt-16 lg:pb-24 relative overflow-hidden">
        {/* Enhanced Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-3 md:mb-8 lg:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-block mb-1.5 md:mb-4"
            >
              <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold">
                Portfolio
              </Badge>
            </motion.div>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-extrabold mb-1.5 md:mb-4"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 via-pink-500 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Our Work
              </span>
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base lg:text-xl text-gray-300 max-w-2xl mx-auto px-2"
            >
              Showcasing innovative solutions that drive real results
            </motion.p>
          </motion.div>

          {/* Websites Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 md:mb-6"
          >
            <div className="flex items-center gap-2 mb-1.5 md:mb-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white">Shopify Websites</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:gap-3">
              {[
                { name: "Beauty Bar", desc: "Luxury Fashion Store", link: "https://beauty-bareg.net/", color: "from-pink-500 to-purple-600" },
                { name: "Montre Watches", desc: "Premium Timepieces", link: "https://montre-co.com/", color: "from-blue-500 to-indigo-600" },
              ].map((site, index) => (
                <motion.a
                  key={index}
                  href={site.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all overflow-hidden"
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${site.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{site.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="text-[10px] text-gray-500">{site.desc}</p>
                  </div>
                  <motion.div 
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${site.color}`}
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* SaaS Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 md:mb-6"
          >
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Cloud className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white">SaaS & Systems</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {[
                { name: "Hollywood Clinic", desc: "Medical Management System", icon: Heart, link: "https://hollywood-clinics.com/", color: "from-blue-500 to-purple-600" },
                { name: "CourierX Pro", desc: "Delivery & Logistics Platform", icon: Package, link: "https://courier-pro-pmxp.vercel.app/login", color: "from-purple-500 to-indigo-600" },
              ].map((saas, index) => (
                <motion.a
                  key={index}
                  href={saas.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all overflow-hidden"
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${saas.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
                  />
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div 
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${saas.color} flex items-center justify-center flex-shrink-0`}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <saas.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{saas.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-xs text-gray-500">{saas.desc}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Automations Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white">Automations</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                { 
                  name: "AI Chatbots", 
                  icon: MessageSquare, 
                  color: "from-blue-500 to-purple-600",
                  desc: "24/7 AI-powered customer support that handles inquiries, answers questions, and guides users automatically."
                },
                { 
                  name: "Omni Channel", 
                  icon: Layers, 
                  color: "from-purple-500 to-indigo-600",
                  desc: "Unified messaging across WhatsApp, Instagram, Facebook & Email - all managed from one dashboard."
                },
                { 
                  name: "Auto Emails", 
                  icon: Mail, 
                  color: "from-indigo-500 to-blue-600",
                  desc: "Automated email sequences for abandoned carts, welcome series, order updates & marketing campaigns."
                },
                { 
                  name: "Product Sync", 
                  icon: Package, 
                  color: "from-blue-600 to-purple-600",
                  desc: "Automatically add, update & sync products across multiple platforms - Shopify, marketplaces & more."
                },
              ].map((auto, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden"
                  onClick={() => {
                    const automationFlows = {
                      "AI Chatbots": {
                        name: "AI Chatbots",
                        icon: MessageSquare,
                        color: "from-blue-500 to-purple-600",
                        description: "24/7 AI-powered customer support that handles inquiries, answers questions, and guides users automatically.",
                        flows: [
                          { step: 1, title: "Customer Inquiry", desc: "Customer sends message via website/chat", icon: MessageSquare, metrics: "100% coverage" },
                          { step: 2, title: "AI Processing", desc: "AI analyzes intent & context in real-time", icon: Brain, metrics: "< 1s response" },
                          { step: 3, title: "Smart Response", desc: "Generates personalized answer or routes to human", icon: Sparkles, metrics: "95% accuracy" },
                          { step: 4, title: "Follow-up", desc: "Tracks conversation & sends follow-up if needed", icon: CheckCircle, metrics: "Auto tracking" },
                        ],
                        stats: { responseTime: "0.8s", satisfaction: "98%", coverage: "24/7", accuracy: "95%" }
                      },
                      "Omni Channel": {
                        name: "Omni Channel",
                        icon: Layers,
                        color: "from-purple-500 to-indigo-600",
                        description: "Unified messaging across WhatsApp, Instagram, Facebook & Email - all managed from one dashboard.",
                        flows: [
                          { step: 1, title: "Multi-Channel Input", desc: "Messages arrive from WhatsApp, Instagram, Facebook, Email", icon: Layers, metrics: "4+ channels" },
                          { step: 2, title: "Unified Dashboard", desc: "All messages appear in one central inbox", icon: Monitor, metrics: "Single view" },
                          { step: 3, title: "Smart Routing", desc: "Auto-assigns to best agent or bot based on query type", icon: GitBranch, metrics: "Smart routing" },
                          { step: 4, title: "Response Sync", desc: "Reply once, appears on customer's preferred channel", icon: RefreshCw, metrics: "Cross-platform" },
                        ],
                        stats: { channels: "4+", responseRate: "99%", unified: "100%", efficiency: "+250%" }
                      },
                      "Auto Emails": {
                        name: "Auto Emails",
                        icon: Mail,
                        color: "from-indigo-500 to-blue-600",
                        description: "Automated email sequences for abandoned carts, welcome series, order updates & marketing campaigns.",
                        flows: [
                          { step: 1, title: "Trigger Event", desc: "Customer action detected (cart abandon, signup, purchase)", icon: Target, metrics: "Real-time" },
                          { step: 2, title: "Sequence Selection", desc: "AI selects best email sequence based on behavior", icon: FileText, metrics: "Personalized" },
                          { step: 3, title: "Email Generation", desc: "Creates & sends personalized email automatically", icon: Mail, metrics: "Auto-send" },
                          { step: 4, title: "Performance Tracking", desc: "Monitors opens, clicks & conversions", icon: BarChart3, metrics: "Full analytics" },
                        ],
                        stats: { openRate: "45%", clickRate: "12%", conversion: "8%", revenue: "+180%" }
                      },
                      "Product Sync": {
                        name: "Product Sync",
                        icon: Package,
                        color: "from-blue-600 to-purple-600",
                        description: "Automatically add, update & sync products across multiple platforms - Shopify, marketplaces & more.",
                        flows: [
                          { step: 1, title: "Product Source", desc: "New product added to main platform (Shopify/ERP)", icon: Package, metrics: "Auto-detect" },
                          { step: 2, title: "Data Mapping", desc: "Maps product data to target platform format", icon: Settings, metrics: "Smart mapping" },
                          { step: 3, title: "Multi-Platform Sync", desc: "Syncs to Amazon, eBay, Facebook Shop, etc.", icon: Cloud, metrics: "5+ platforms" },
                          { step: 4, title: "Inventory Update", desc: "Keeps stock levels synchronized in real-time", icon: Activity, metrics: "Live sync" },
                        ],
                        stats: { platforms: "5+", syncTime: "2min", accuracy: "100%", timeSaved: "20hrs/week" }
                      }
                    };
                    openModal("automation", automationFlows[auto.name as keyof typeof automationFlows]);
                  }}
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${auto.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{ 
                      boxShadow: ["0 0 0 0 rgba(139, 92, 246, 0)", "0 0 0 4px rgba(139, 92, 246, 0.1)", "0 0 0 0 rgba(139, 92, 246, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                  />
                  <div className="relative z-10">
                    <motion.div 
                      className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${auto.color} flex items-center justify-center`}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                    >
                      <auto.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors block text-center">{auto.name}</span>
                    <p className="text-[9px] text-gray-500 mt-1 text-center line-clamp-2 group-hover:text-gray-400 transition-colors">Tap to learn more</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Button - Contact Us */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="py-2 md:py-4 text-center bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20"
      >
        <Button
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-xs md:text-sm lg:text-base px-5 py-2.5 md:px-7 md:py-3.5 rounded-lg md:rounded-xl shadow-lg shadow-blue-500/50 font-semibold"
          onClick={() => scrollToSection("contact")}
        >
          <MessageSquare className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          Contact Us
          <ArrowRight className="ml-1.5 md:ml-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </Button>
      </motion.div>

      {/* Enhanced Team Section */}
      <section ref={sectionRefs.team} id="team" className="pt-4 pb-6 md:pt-12 md:pb-16 lg:pt-16 lg:pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 via-cyan-900/10 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-8xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-4 md:mb-8 lg:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-block mb-2 md:mb-4"
            >
              <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold">
                Our Experts
              </Badge>
            </motion.div>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="text-3xl md:text-6xl lg:text-7xl font-extrabold mb-3 md:mb-6 cursor-pointer"
              onClick={() =>
                toast({
                  title: "Expert Team",
                  description: "Meet the visionaries and technical experts driving innovation at Star Solutions.",
                  duration: 3000,
                })
              }
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Expert Team
              </span>
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto px-4"
            >
              Meet the visionaries and technical experts driving innovation at Star Solutions
            </motion.p>
          </motion.div>

          {/* Scroll Hint - Compact on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-2 md:mb-4"
          >
            <p className="text-gray-400 text-xs md:text-sm flex items-center justify-center">
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-pulse" />
              <span className="hidden sm:inline">Scroll to meet all team members</span>
              <span className="sm:hidden">Swipe to explore</span>
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 animate-pulse" />
            </p>
          </motion.div>

          <div className="relative">
            <button
              aria-label="Previous"
              onClick={() => scrollHorizontally(teamScrollRef, "left")}
              className="flex items-center justify-center absolute -left-1 md:-left-2 lg:-left-4 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 z-10"
            >
              <span className="sr-only">Previous</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white"><path fillRule="evenodd" d="M15.78 3.72a.75.75 0 010 1.06L9.56 11l6.22 6.22a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
            </button>
            <div ref={teamScrollRef} className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-4 md:pb-6 px-4 md:px-0 -mx-4 md:mx-0 snap-x snap-mandatory scrollbar-hide">
            {Object.entries(teamDetails).map(([key, member], index) => {
              const gradients = [
                { color: "from-blue-500 to-purple-600", bg: "from-blue-500/20 to-purple-600/20" },
                { color: "from-purple-500 to-indigo-600", bg: "from-purple-500/20 to-indigo-600/20" },
                { color: "from-indigo-500 to-blue-600", bg: "from-indigo-500/20 to-blue-600/20" },
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
              <motion.div
                key={key}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer flex-shrink-0 w-[75vw] sm:w-[70vw] md:w-[80vw] max-w-[280px] md:max-w-[300px] snap-center"
                onClick={() => openModal("team", member)}
              >
                {/* Animated glow */}
                <motion.div 
                  className={`absolute -inset-1 bg-gradient-to-r ${gradient.color} rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700`}
                />
                
                <Card className="relative bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-xl border border-white/10 group-hover:border-white/30 transition-all duration-500 overflow-hidden rounded-2xl md:rounded-3xl">
                  {/* Top accent */}
                  <motion.div 
                    className={`absolute top-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r ${gradient.color}`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                  />
                  
                  <CardContent className="p-4 md:p-6 text-center relative">
                    {/* Avatar with animated ring - Smaller on mobile */}
                    <div className="relative mx-auto w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className={`absolute inset-0 border border-dashed md:border-2 ${index === 0 ? 'border-cyan-500/40' : index === 1 ? 'border-purple-500/40' : 'border-emerald-500/40'} rounded-full`}
                      />
                      <div className={`w-full h-full bg-gradient-to-br ${gradient.bg} rounded-full flex items-center justify-center`}>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <Users className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        </motion.div>
                      </div>
                      {/* Status indicator - Smaller on mobile */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6 bg-green-500 rounded-full border border-black md:border-2 flex items-center justify-center"
                      >
                        <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-white" />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-base md:text-xl font-bold mb-1 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
                      {member.name}
                    </h3>
                    <p className={`text-xs md:text-sm font-semibold mb-1 md:mb-2 bg-gradient-to-r ${gradient.color} bg-clip-text text-transparent`}>
                      {member.role}
                    </p>
                    <p className="text-gray-400 text-[10px] md:text-xs mb-3 md:mb-4 line-clamp-2">{member.expertise}</p>
                    
                    {/* Skills visualization - More compact on mobile */}
                    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1.5 md:mb-2">Expertise Level</p>
                      <div className="flex gap-0.5 md:gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <motion.div
                            key={level}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + level * 0.05 + 0.3 }}
                            className={`w-4 h-1.5 md:w-8 md:h-2 rounded-full bg-gradient-to-r ${gradient.color} opacity-${level <= 5 ? '100' : '30'}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-end gap-0.5 h-6 md:h-8 mt-2 md:mt-3 justify-center">
                        {[40, 65, 80, 55, 90, 70].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + i * 0.08 + 0.4, duration: 0.4 }}
                            className={`w-2 md:w-3 bg-gradient-to-t ${gradient.color} rounded-t opacity-70`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Social links - Smaller on mobile */}
                    <div className="flex gap-1.5 md:gap-2 justify-center mb-3 md:mb-4">
                      {member.social?.linkedin && (
                        <motion.div 
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </motion.div>
                      )}
                      {member.social?.github && (
                        <motion.div 
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </motion.div>
                      )}
                      {member.social?.twitter && (
                        <motion.div 
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Twitter className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* View Profile Button - More compact on mobile */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className={`w-full bg-gradient-to-r ${gradient.color} hover:opacity-90 text-white font-semibold py-2.5 md:py-4 rounded-lg md:rounded-xl relative overflow-hidden group/btn text-xs md:text-sm`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10">View Profile</span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )})}
            </div>
            <button
              aria-label="Next"
              onClick={() => scrollHorizontally(teamScrollRef, "right")}
              className="flex items-center justify-center absolute -right-1 md:-right-2 lg:-right-4 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 z-10"
            >
              <span className="sr-only">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white"><path fillRule="evenodd" d="M8.22 20.28a.75.75 0 010-1.06L14.44 13 8.22 6.78a.75.75 0 111.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 01-1.06 0z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Button - Get Started */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="py-2 md:py-4 text-center bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-cyan-900/20"
      >
        <Button
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 text-xs md:text-sm lg:text-base px-5 py-2.5 md:px-7 md:py-3.5 rounded-lg md:rounded-xl shadow-lg shadow-indigo-500/50 font-semibold"
          onClick={() => scrollToSection("contact")}
        >
          <Rocket className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          Get Started
          <ArrowRight className="ml-1.5 md:ml-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </Button>
      </motion.div>

      {/* Enhanced Testimonials Section */}
      <section ref={sectionRefs.insights} id="insights" className="pt-2 pb-4 md:pt-6 md:pb-8 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-8xl">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mt-0 md:mt-2"
          >
            <div className="text-center mb-3 md:mb-6 lg:mb-8">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-block mb-2 md:mb-4"
              >
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold">
                  Client Love
                </Badge>
              </motion.div>
              <motion.h3
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-extrabold mb-2 md:mb-4 cursor-pointer"
                onClick={() =>
                  toast({
                    title: "Client Success Stories",
                    description: "Real testimonials from our satisfied clients across different industries.",
                    duration: 3000,
                  })
                }
              >
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Client Success Stories
                </span>
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base lg:text-xl text-gray-300 mb-4 md:mb-8 px-2"
              >
                Real testimonials from our satisfied clients
              </motion.p>
              
              {/* Enhanced Feedback Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl shadow-purple-500/50 relative overflow-hidden group"
                  onClick={openFeedbackModal}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <MessageSquare className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Share Your Feedback
                </Button>
              </motion.div>
            </div>

            <div className="relative">
              <button
                aria-label="Previous"
                onClick={() => scrollHorizontally(testimonialsScrollRef, "left")}
                className="flex items-center justify-center absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 z-10"
              >
                <span className="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-white"><path fillRule="evenodd" d="M15.78 3.72a.75.75 0 010 1.06L9.56 11l6.22 6.22a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
              </button>
              <div ref={testimonialsScrollRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
              {Object.entries(testimonialDetails).map(([key, testimonial], index) => {
                const gradients = [
                  { color: "from-blue-500 to-purple-600", bg: "from-blue-500/20 to-purple-600/20" },
                  { color: "from-purple-500 to-indigo-600", bg: "from-purple-500/20 to-indigo-600/20" },
                  { color: "from-indigo-500 to-blue-600", bg: "from-indigo-500/20 to-blue-600/20" },
                  { color: "from-blue-600 to-purple-600", bg: "from-blue-600/20 to-purple-600/20" },
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                <motion.div
                  key={key}
                  initial={{ y: 100, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer w-[88vw] max-w-[340px] snap-center flex-shrink-0"
                  onClick={() => openModal("testimonial", testimonial)}
                >
                  {/* Animated glow */}
                  <motion.div 
                    className={`absolute -inset-1 bg-gradient-to-r ${gradient.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700`}
                  />
                  
                  <Card className="relative bg-gradient-to-br from-black/95 via-slate-900/95 to-black/95 backdrop-blur-2xl border-2 border-white/10 group-hover:border-white/40 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10">
                    {/* Enhanced Top accent */}
                    <motion.div 
                      className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient.color}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.2, duration: 0.6 }}
                    />
                    
                    {/* Animated glow */}
                    <motion.div
                      className={`absolute -inset-1 bg-gradient-to-r ${gradient.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                    />
                    
                    {/* Corner decoration */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient.color} opacity-5 rounded-bl-full`} />
                    
                    {/* Enhanced Quote icon */}
                    <motion.div
                      className="absolute top-6 right-6 opacity-10 group-hover:opacity-30 transition-opacity"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <MessageSquare className="w-20 h-20 text-white" />
                    </motion.div>
                    
                    <CardContent className="p-6 relative">
                      {/* Rating with animated stars */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: -180 }}
                              whileInView={{ scale: 1, rotate: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.15 + i * 0.08, type: "spring" as const }}
                            >
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </motion.div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{testimonial.rating}.0</span>
                        <Badge className={`ml-auto bg-gradient-to-r ${gradient.color} text-white border-0 text-xs`}>
                          Verified
                        </Badge>
                      </div>

                      {/* Testimonial content */}
                      <blockquote className="text-gray-300 mb-5 text-sm leading-relaxed line-clamp-4 group-hover:text-gray-200 transition-colors">
                        "{testimonial.content}"
                      </blockquote>
                      
                      {/* Satisfaction meter */}
                      <div className="mb-5 p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-500">Satisfaction</span>
                          <span className={`bg-gradient-to-r ${gradient.color} bg-clip-text text-transparent font-bold`}>{testimonial.satisfaction || "100%"}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: testimonial.satisfaction || "100%" }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 + 0.4, duration: 0.8 }}
                            className={`h-full bg-gradient-to-r ${gradient.color} rounded-full`}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                          <span>Duration: {testimonial.duration || "Ongoing"}</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-blue-400" />
                            +95% ROI
                          </span>
                        </div>
                      </div>

                      {/* Client info */}
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div 
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                          className={`w-12 h-12 bg-gradient-to-br ${gradient.bg} rounded-full flex items-center justify-center`}
                        >
                          <Users className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{testimonial.name}</div>
                          <div className={`text-xs bg-gradient-to-r ${gradient.color} bg-clip-text text-transparent`}>{testimonial.role}</div>
                          <div className="text-gray-500 text-xs truncate">{testimonial.company}</div>
                        </div>
                      </div>

                      {/* Project type badge */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-white/20 text-gray-400 text-xs">
                          {testimonial.projectType}
                        </Badge>
                        <motion.div 
                          whileHover={{ x: 3 }}
                          className="flex items-center text-xs text-gray-500 group-hover:text-white transition-colors"
                        >
                          Read More <ArrowRight className="w-3 h-3 ml-1" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )})}
              </div>
              <button
                aria-label="Next"
                onClick={() => scrollHorizontally(testimonialsScrollRef, "right")}
                className="flex items-center justify-center absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 bg-black/50 hover:bg-black/70 z-10"
              >
                <span className="sr-only">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-white"><path fillRule="evenodd" d="M8.22 20.28a.75.75 0 010-1.06L14.44 13 8.22 6.78a.75.75 0 111.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 01-1.06 0z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Button - Start Your Project */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="py-2 md:py-4 text-center bg-gradient-to-r from-pink-900/20 via-purple-900/20 to-cyan-900/20"
      >
        <Button
          className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-700 hover:via-purple-700 hover:to-cyan-700 text-xs md:text-sm lg:text-base px-5 py-2.5 md:px-7 md:py-3.5 rounded-lg md:rounded-xl shadow-lg shadow-pink-500/50 font-semibold"
          onClick={() => scrollToSection("contact")}
        >
          <Sparkles className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          Start Your Project
          <ArrowRight className="ml-1.5 md:ml-2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </Button>
      </motion.div>

      {/* Enhanced Contact Section */}
      <section ref={sectionRefs.contact} id="contact" className="pt-4 pb-6 md:pt-12 md:pb-16 lg:pt-16 lg:pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 via-pink-900/20 to-cyan-900/20" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-8xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-3 md:mb-6 lg:mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-block mb-2 md:mb-4"
            >
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold">
                Get In Touch
              </Badge>
            </motion.div>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-extrabold mb-2 md:mb-4 lg:mb-6 cursor-pointer"
              onClick={() =>
                toast({
                  title: "Let's Build Together",
                  description: "Ready to transform your business with cutting-edge technology solutions?",
                  duration: 3000,
                })
              }
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Let's Build Together
              </span>
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2"
            >
              Ready to transform your business with{" "}
              <span className="text-cyan-400 font-semibold">cutting-edge</span> technology solutions? Let's discuss your project and
              create something{" "}
              <span className="text-purple-400 font-semibold">extraordinary</span>.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-6 lg:space-y-8"
            >
              <div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 lg:mb-8 text-white">Get in Touch</h3>
                <div className="space-y-3 md:space-y-4 lg:space-y-6">
                  {[
                    {
                      icon: Mail,
                      title: "Email Us",
                      content: "info@starsolution.ai",
                      description: "Send us your project details",
                    },
                    {
                      icon: Phone,
                      title: "Call Us",
                      content: "+1 (555) 123-4567",
                      description: "Speak with our experts",
                    },

                  ].map((contact, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                      className="flex items-start p-6 rounded-2xl bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                      onClick={() =>
                        toast({
                          title: contact.title,
                          description: contact.content,
                          duration: 3000,
                        })
                      }
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                      >
                        <contact.icon className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{contact.title}</h4>
                        <p className="text-cyan-400 mb-1">{contact.content}</p>
                        <p className="text-gray-400 text-sm">{contact.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-4 text-white">Why Choose Star Solutions?</h4>
                <div className="space-y-3">
                  {[
                    "24/7 Technical Support",
                    "Agile Development Process",
                    "Transparent Communication",
                    "Cutting-edge Technologies",
                    "Proven Track Record",
  
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center text-gray-300 cursor-pointer"
                      onClick={() =>
                        toast({
                          title: benefit,
                          description: "Benefit details would be shown in a real implementation.",
                          duration: 3000,
                        })
                      }
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                        className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mr-3 flex-shrink-0"
                      />
                      {benefit}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-black/90 via-slate-900/90 to-black/90 backdrop-blur-2xl border-2 border-white/10 hover:border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full" />
                
                <CardContent className="p-8 md:p-10 relative z-10">
                  <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 lg:mb-8">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                      className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center"
                    >
                      <Rocket className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                    </motion.div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white">
                      <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Start Your Project
                      </span>
                    </h3>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 lg:space-y-6">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                          placeholder=""
                        />
                        {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                          placeholder=""
                        />
                        {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                          placeholder=""
                        />
                      </div>
                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                          Project Budget
                        </label>
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                        >
                          <option value="" className="bg-slate-800">
                            Select Budget Range
                          </option>
                          <option value="5k-15k" className="bg-slate-800">
                            $5K - $15K
                          </option>
                          <option value="15k-50k" className="bg-slate-800">
                            $15K - $50K
                          </option>
                          <option value="50k-100k" className="bg-slate-800">
                            $50K - $100K
                          </option>
                          <option value="100k+" className="bg-slate-800">
                            $100K+
                          </option>
                        </motion.select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                        Project Details *
                      </label>
                      <motion.textarea
                        whileFocus={{ scale: 1.02 }}
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 resize-none md:rows-6"
                        placeholder=""
                      />
                      {formErrors.message && <p className="text-red-400 text-sm mt-1">{formErrors.message}</p>}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-lg py-7 rounded-2xl shadow-2xl shadow-purple-500/50 group relative overflow-hidden font-semibold"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                          />
                        ) : (
                          <Rocket className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        )}
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && (
                          <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="pt-4 pb-6 md:pt-8 md:pb-10 lg:pt-10 lg:pb-12 border-t-2 border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/50 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-8xl">
          <div className="grid lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12 lg:mb-16">
            <div className="lg:col-span-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6 lg:mb-8 cursor-pointer group"
                onClick={() =>
                  toast({
                    title: "Star Solutions",
                    description: "Building digital empires through innovative technology solutions.",
                    duration: 3000,
                  })
                }
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow"
                >
                  <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Star Solutions
                </span>
              </motion.div>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8 lg:mb-10 max-w-md">
                Transforming businesses through{" "}
                <span className="text-cyan-400 font-semibold">innovative</span> software development,{" "}
                <span className="text-purple-400 font-semibold">digital marketing</span>, and{" "}
                <span className="text-pink-400 font-semibold">AI solutions</span>.
                Building the future, one project at a time.
              </p>
              <div className="flex space-x-4 md:space-x-6">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Instagram, label: "Instagram" },
                ].map((social, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-all duration-300"
                    onClick={() =>
                      toast({
                        title: `Follow us on ${social.label}`,
                        description: `${social.label} profile would open in a real implementation.`,
                        duration: 3000,
                      })
                    }
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection('services')}
                className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-2.5 md:p-3 mb-2 md:mb-3 flex items-center justify-between text-white font-bold text-sm md:text-base hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <span>SERVICES</span>
                <motion.div
                  animate={{ rotate: expandedSections.services ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {expandedSections.services && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 md:space-y-2 pl-2 md:pl-3">
                      {[
                        { name: "Shopify Websites", action: "Complete Shopify store development & optimization", section: "services" },
                        { name: "Business Systems", action: "Custom SaaS solutions for your industry", section: "services" },
                        { name: "Automations", action: "Smart automation solutions to boost productivity", section: "services" },
                      ].map((service, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ x: 5, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center text-gray-300 hover:text-cyan-400 transition-colors duration-300 text-left cursor-pointer group py-1"
                          onClick={() => {
                            if (service.section === "services") {
                              scrollToSection("services");
                            } else {
                              toast({
                                title: service.name,
                                description: service.action,
                                duration: 3000,
                              });
                            }
                          }}
                        >
                          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 md:mr-3 text-cyan-400 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                          <span className="group-hover:text-cyan-400 transition-colors duration-300 text-sm md:text-base">
                            {service.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection('company')}
                className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-2.5 md:p-3 mb-2 md:mb-3 flex items-center justify-between text-white font-bold text-sm md:text-base hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <span>COMPANY</span>
                <motion.div
                  animate={{ rotate: expandedSections.company ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {expandedSections.company && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 md:space-y-2 pl-2 md:pl-3">
                      {[
                        { name: "About Us", action: "Learn about our mission and values", section: "about" },
                        { name: "Our Team", action: "Meet our expert professionals", section: "team" },
                        { name: "Careers", action: "Join our growing team", section: "careers" },
                        { name: "Contact", action: "Get in touch with us", section: "contact" },
                        { name: "Blog", action: "Read our latest insights", section: "blog" }
                      ].map((item, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ x: 5, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center text-gray-300 hover:text-cyan-400 transition-colors duration-300 text-left cursor-pointer group py-1"
                          onClick={() => {
                            if (item.section === "contact") {
                              scrollToSection("contact");
                            } else if (item.section === "team") {
                              scrollToSection("team");
                            } else {
                              toast({
                                title: item.name,
                                description: item.action,
                                duration: 3000,
                              });
                            }
                          }}
                        >
                          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 md:mr-3 text-cyan-400 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                          <span className="group-hover:text-cyan-400 transition-colors duration-300 text-sm md:text-base">
                            {item.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 Star Solutions. All rights reserved. Built with passion and cutting-edge technology.
              </p>
              <div className="flex space-x-6">
                {[
                  { name: "Privacy Policy", policy: "privacy" },
                  { name: "Terms of Service", policy: "terms" },
                  { name: "Cookie Policy", policy: "cookies" }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm cursor-pointer group"
                    onClick={() => openPolicy(item.policy)}
                  >
                    <span className="group-hover:text-cyan-400 transition-colors duration-300">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {activePolicy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closePolicy}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden my-8 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {activePolicy === 'privacy' && 'Privacy Policy'}
                {activePolicy === 'terms' && 'Terms of Service'}
                {activePolicy === 'cookies' && 'Cookie Policy'}
              </h2>
              <button
                onClick={closePolicy}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activePolicy === 'privacy' && (
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg font-semibold text-white mb-4">Information We Collect</p>
                  <p>
                    At Star Solutions, we collect information you provide directly to us, such as when you create an account, 
                    request our services, or contact us for support. This includes your name, email address, company information, 
                    project requirements, and any other information you choose to provide.
                  </p>
                  <p>
                    We also automatically collect certain information about your use of our website, including your IP address, 
                    browser type, operating system, access times, and the pages you have viewed directly before and after accessing our website.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">How We Use Your Information</p>
                  <p>
                    We use the information we collect to provide, maintain, and improve our services, including website development, 
                    digital marketing, content creation, and other digital solutions. We may use your information to communicate with you 
                    about our services, send you technical notices and support messages, and respond to your comments and questions.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Information Sharing</p>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                    except as described in this policy. We may share your information with trusted third parties who assist us in 
                    operating our website, conducting our business, or servicing you, as long as those parties agree to keep this 
                    information confidential.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Data Security</p>
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, 
                    alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic 
                    storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Can the Privacy Policy Change?</p>
                  <p>
                    We may occasionally make changes to this privacy policy, for example to comply with new requirements imposed by applicable laws or technical requirements. We will post the updated privacy policy on our website. We therefore encourage you to review this page every so often.
                  </p>
                  <p>
                    We may also notify you in case of material changes and, where required by applicable law, we will seek your consent to those changes.
                  </p>
                  <p>
                    If we wish to process your personal information for a new purpose not described in this privacy policy, where necessary we will inform you and where required we will seek your consent.
                  </p>
                  <p className="mt-4">
                    <strong>Want to know more? You may be interested in the following sections of our Privacy Policy:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>What is covered by this privacy policy?</li>
                    <li>Who collects & uses your personal information?</li>
                    <li>What are your rights regarding your personal information?</li>
                  </ul>
                </div>
              )}

              {activePolicy === 'terms' && (
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg font-semibold text-white mb-4">Service Description</p>
                  <p>
                    Star Solutions provides comprehensive digital services including but not limited to website development 
                    (frontend and backend), digital marketing strategies, content creation, brand development, and other 
                    technology-related services. Our services are tailored to meet the specific needs of businesses seeking 
                    to establish or enhance their digital presence.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Service Agreement</p>
                  <p>
                    By engaging our services, you agree to provide accurate and complete information necessary for project 
                    execution. You are responsible for ensuring that all content, materials, and information provided to us 
                    do not infringe upon any third-party rights and comply with applicable laws and regulations.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Payment Terms</p>
                  <p>
                    Payment terms will be specified in individual project agreements. Generally, we require a deposit 
                    before commencing work, with remaining payments due upon project milestones or completion. All prices 
                    are subject to change with 30 days' notice for ongoing services.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Intellectual Property</p>
                  <p>
                    Upon full payment, you will own all rights to the custom work we create for you. We retain the right 
                    to use general knowledge, skills, and techniques developed during the course of providing services. 
                    Any pre-existing intellectual property remains with its respective owners.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Limitation of Liability</p>
                  <p>
                    Our liability for any claims arising from our services is limited to the amount paid for the specific 
                    service in question. We are not liable for any indirect, incidental, special, or consequential damages 
                    arising from the use of our services.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Termination</p>
                  <p>
                    Either party may terminate services with 30 days' written notice. Upon termination, you will be 
                    responsible for payment of all work completed up to the termination date. We will provide you with 
                    all work product and materials created for your project.
                  </p>
                </div>
              )}

              {activePolicy === 'cookies' && (
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg font-semibold text-white mb-4">What Are Cookies</p>
                  <p>
                    Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                    They help us provide you with a better experience by remembering your preferences and enabling certain 
                    functionality. We use both session cookies (which expire when you close your browser) and persistent 
                    cookies (which remain on your device for a set period).
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Types of Cookies We Use</p>
                  <p>
                    <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. 
                    They enable basic functions like page navigation, access to secure areas, and form submissions. 
                    The website cannot function properly without these cookies.
                  </p>
                  <p>
                    <strong>Analytics Cookies:</strong> We use these cookies to understand how visitors interact with our 
                    website by collecting and reporting information anonymously. This helps us improve our website's 
                    performance and user experience.
                  </p>
                  <p>
                    <strong>Marketing Cookies:</strong> These cookies are used to track visitors across websites to display 
                    relevant and engaging advertisements. They help us measure the effectiveness of our marketing campaigns.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Managing Cookies</p>
                  <p>
                    You can control and manage cookies through your browser settings. Most browsers allow you to refuse 
                    cookies or delete them. However, disabling certain cookies may affect the functionality of our website 
                    and your ability to access certain features.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Third-Party Cookies</p>
                  <p>
                    We may use third-party services that set their own cookies, such as Google Analytics, social media 
                    platforms, and advertising networks. These third parties have their own privacy policies and cookie 
                    practices, which we encourage you to review.
                  </p>
                  
                  <p className="text-lg font-semibold text-white mb-4 mt-6">Updates to This Policy</p>
                  <p>
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                    operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
                    updated policy on our website.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeFeedbackModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
              <button
                onClick={closeFeedbackModal}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="feedbackName" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      id="feedbackName"
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      placeholder="Enter your full name"
                    />
                    {feedbackErrors.name && (
                      <p className="text-red-400 text-sm mt-1">{feedbackErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedbackEmail" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="email"
                      id="feedbackEmail"
                      value={feedbackData.email}
                      onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      placeholder="Enter your email address"
                    />
                    {feedbackErrors.email && (
                      <p className="text-red-400 text-sm mt-1">{feedbackErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= feedbackData.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {feedbackErrors.rating && (
                    <p className="text-red-400 text-sm mt-1">{feedbackErrors.rating}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">
                    {feedbackData.rating > 0 ? `${feedbackData.rating} out of 5 stars` : "Please select a rating"}
                  </p>
                </div>

                <div>
                  <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Feedback *
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    id="feedbackText"
                    value={feedbackData.feedback}
                    onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                    placeholder="Please share your feedback about our services..."
                  />
                  {feedbackErrors.feedback && (
                    <p className="text-red-400 text-sm mt-1">{feedbackErrors.feedback}</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeFeedbackModal}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
