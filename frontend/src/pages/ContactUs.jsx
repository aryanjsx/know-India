import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaEnvelope, FaLinkedin, FaInstagram, FaChevronDown, FaChevronUp } from "react-icons/fa";

const ContactUs = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const containerRef = useRef(null);
    const [expandedFaq, setExpandedFaq] = useState(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // Calculate background gradient position based on mouse movement
    const calculateGradientPosition = () => {
        const x = (mousePosition.x / window.innerWidth) * 100;
        const y = (mousePosition.y / window.innerHeight) * 100;
        return { x, y };
    };

    const gradientPos = calculateGradientPosition();

    const contactInfo = [
        {
            icon: <FaMapMarkerAlt className="text-blue-600" size={24} />,
            title: "Our Location",
            details: "Hi Tech City, Hyderabad, Telangana, India",
        },
        {
            icon: <FaEnvelope className="text-blue-600" size={24} />,
            title: "Email Address",
            details: "kumararyan1929@gmail.com",
        },
    ];

    const socialLinks = [
        { icon: <FaLinkedin size={22} />, name: "LinkedIn", url: "https://www.linkedin.com/in/aryanjsx/" },
        { icon: <FaInstagram size={22} />, name: "Instagram", url: "https://www.instagram.com/aryanjsx/" },
    ];

    // FAQ data
    const faqData = [
        {
            question: "What is the best time to visit India?",
            answer: "The best time to visit India depends on the region. Generally, October to March is considered the best time as the weather is pleasant across most parts of the country. Summer (April to June) can be extremely hot, while the monsoon season (July to September) brings heavy rainfall to many regions."
        },
        {
            question: "Do I need a visa to visit India?",
            answer: "Yes, most foreign nationals require a visa to enter India. India offers various types of visas including tourist, business, and e-visas. The e-visa facility is available for citizens of many countries and can be applied for online."
        },
        {
            question: "What are some must-visit places in India?",
            answer: "India offers numerous attractions including the Taj Mahal in Agra, the Golden Temple in Amritsar, the beaches of Goa, the backwaters of Kerala, the Himalayan mountains, historic sites in Delhi, and the vibrant cities of Mumbai, Jaipur, and Varanasi. Each region offers unique cultural and natural experiences."
        },
        {
            question: "What languages are spoken in India?",
            answer: "India is linguistically diverse with 22 officially recognized languages. Hindi is the most widely spoken language and serves as the official language along with English. Other major languages include Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, and Punjabi, each with millions of speakers."
        },
        {
            question: "What is the currency of India?",
            answer: "The currency of India is the Indian Rupee (INR). It's denoted by the symbol ₹. Currency notes are available in denominations of 10, 20, 50, 100, 200, 500, and 2000 rupees, while coins come in denominations of 1, 2, 5, and 10 rupees."
        }
    ];

    // Toggle FAQ item
    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
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
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    };

    return (
        <>
            {/* Enhanced Animated Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-20">
                {/* Main gradient background with enhanced colors */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/90"
                    style={{
                        backgroundPosition: `${gradientPos.x}% ${gradientPos.y}%`,
                        y: backgroundY
                    }}
                />

                {/* Animated geometric shapes */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    {[...Array(20)].map((_, index) => (
                        <motion.div
                            key={index}
                            className={`absolute ${index % 3 === 0
                                    ? "rounded-full"
                                    : index % 3 === 1
                                        ? "rounded-lg rotate-45"
                                        : "rounded-md"
                                } bg-gradient-to-r ${index % 4 === 0
                                    ? "from-blue-400/10 to-indigo-400/10"
                                    : index % 4 === 1
                                        ? "from-indigo-400/10 to-purple-400/10"
                                        : index % 4 === 2
                                            ? "from-blue-400/10 to-cyan-400/10"
                                            : "from-cyan-400/10 to-indigo-400/10"
                                }`}
                            style={{
                                width: `${Math.random() * 300 + 50}px`,
                                height: `${Math.random() * 300 + 50}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: 0.4,
                            }}
                            animate={{
                                x: [0, Math.random() * 40 - 20],
                                y: [0, Math.random() * 40 - 20],
                                rotate: [0, Math.random() * 20 - 10],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: Math.random() * 20 + 15,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* Subtle dot pattern with enhanced opacity */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}
                />

                {/* Enhanced light beams with more vibrant colors */}
                <motion.div
                    className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] bg-blue-200/15 blur-3xl rounded-full"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] bg-indigo-200/15 blur-3xl rounded-full"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 25,
                        delay: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Additional animated gradient overlay */}
                <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{
                        background: 'linear-gradient(120deg, rgba(59, 130, 246, 0.1), rgba(79, 70, 229, 0.1), rgba(59, 130, 246, 0.1))',
                        backgroundSize: '400% 400%'
                    }}
                    animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            <div ref={containerRef} className="relative pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto min-h-screen flex flex-col">
                {/* Hero Section with enhanced animations */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 relative"
                >
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ backgroundSize: "200% 200%" }}
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 mx-auto mb-8 max-w-md"
                    ></motion.div>
                    <motion.p
                        className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Have questions about India's rich culture, heritage, or places to visit?
                        We're here to help you discover the beauty and diversity of India.
                    </motion.p>
                </motion.div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    {/* Contact Information Card with enhanced styling */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden h-fit"
                        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                    >
                        {/* Enhanced decorative elements */}
                        <motion.div
                            className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/30 rounded-full blur-2xl"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div
                            className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-100/30 rounded-full blur-2xl"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 8,
                                delay: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        <h2 className="text-2xl font-bold mb-8 text-gray-800 relative">
                            <span className="relative">
                                Contact Information
                                <motion.span
                                    className="absolute -bottom-2 left-0 h-1 bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </span>
                        </h2>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                        >
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ x: 5, backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                                    className="flex items-start space-x-4 relative z-10 group p-3 rounded-lg transition-all duration-300"
                                >
                                    <div className="mt-1 bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors shadow-sm">
                                        {info.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{info.title}</h3>
                                        <p className="text-gray-600 mt-1">{info.details}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Enhanced Social Media Links */}
                        <div className="mt-10">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 relative inline-block">
                                Connect With Us
                                <motion.span
                                    className="absolute -bottom-1 left-0 h-0.5 bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.8, delay: 1 }}
                                />
                            </h3>
                            <div className="flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white p-3 rounded-full shadow-md text-blue-600 hover:text-white hover:bg-blue-600 transition-colors duration-300"
                                        whileHover={{
                                            y: -5,
                                            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
                                            scale: 1.1
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                    >
                                        {social.icon}
                                        <span className="sr-only">{social.name}</span>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Map Section with enhanced styling */}
                    <div className="flex-1 min-h-[300px] relative h-full flex">
                        {/* Map loading animation */}
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, delay: 1.5 }}
                                className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                                />
                            </motion.div>
                        </AnimatePresence>

                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15224.999278771018!2d78.3661981543885!3d17.447753084089594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sHITEC%20City%2C%20Hyderabad%2C%20Telangana%20500081!5e0!3m2!1sen!2sin!4v1741519568235!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Our Location"
                            className="flex-1"
                        ></iframe>
                    </div>


                    {/* FAQ Section - Moved inside the grid */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden h-fit lg:col-span-2"
                        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                    >
                        {/* Enhanced decorative elements */}
                        <motion.div
                            className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/30 rounded-full blur-2xl"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div
                            className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-100/30 rounded-full blur-2xl"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 8,
                                delay: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 relative">
                            <span className="relative">
                                Frequently Asked Questions
                                <motion.span
                                    className="absolute -bottom-2 left-0 h-1 bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </span>
                        </h2>

                        <div className="space-y-4 max-w-4xl mx-auto">
                            {faqData.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 * index, duration: 0.5 }}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <motion.button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                                        whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                                    >
                                        <span className="font-medium text-gray-800">{faq.question}</span>
                                        {expandedFaq === index ?
                                            <FaChevronUp className="text-blue-600" /> :
                                            <FaChevronDown className="text-blue-600" />
                                        }
                                    </motion.button>
                                    <AnimatePresence>
                                        {expandedFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 bg-white text-gray-600 border-t border-gray-200">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Enhanced Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white font-medium px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
                        style={{ backgroundSize: "200% 200%" }}
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <a href="mailto:kumararyan1929@gmail.com" className="flex items-center space-x-2">
                            <FaEnvelope />
                            <span>Email Us Directly</span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default ContactUs; 