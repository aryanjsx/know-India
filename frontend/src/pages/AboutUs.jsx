import React from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaEnvelope, FaGlobe } from "react-icons/fa";
import Brajesh from "../Assets/Brajesh.JPG";
import Aryan from "../Assets/Aryan.webp";
import { useTheme } from "../context/ThemeContext";

const AboutUs = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const teamMembers = [
        {
            id: 1,
            name: "Brajesh Jha",
            role: "Software Engineer",
            bio: "Passionate software engineer with expertise in building scalable applications. Specializes in full stack development and Python applications.",
            image: Brajesh,
            social: {
                linkedin: "https://www.linkedin.com/in/brajeshkrjha",
                github: "https://github.com/brajeshkrjha",
                email: "mailto:brajeshjha2001@gmail.com",
                portfolio: "https://brajesh.netlify.app",
            },
        },
        {
            id: 2,
            name: "Aryan Kumar",
            role: "Software Engineer",
            bio: "Full-stack developer with a focus on creating intuitive user experiences. Passionate about modern web technologies and Cloud Computing.",
            image: Aryan,
            social: {
                linkedin: "https://www.linkedin.com/in/aryank728",
                github: "https://github.com/Aryank728",
                email: "mailto:Kumararyan1929@gmail.com",
                portfolio: "https://aryankr.netlify.app",
            },
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
    };

    return (
        <div className={`min-h-screen ${
            isDark 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
                : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
        }`}>
            <div className="relative pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r ${
                        isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
                    } bg-clip-text text-transparent`}>
                        About Us
                    </h1>
                    <div className={`h-1 bg-gradient-to-r ${
                        isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
                    } mx-auto mb-8 max-w-md`}></div>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-3xl mx-auto`}>
                        We are passionate developers dedicated to showcasing the rich cultural heritage and diversity of India.
                        Our mission is to create an immersive digital experience that educates and inspires people about India's history, traditions, and landmarks.
                    </p>
                </motion.div>

                {/* Team Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16"
                >
                    {teamMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            variants={itemVariants}
                            className={`rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border ${
                                isDark 
                                    ? 'bg-gray-800/90 border-gray-700 hover:shadow-purple-500/10' 
                                    : 'bg-white/90 border-gray-100 hover:shadow-purple-500/20'
                            }`}
                        >
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-2/5">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="md:w-3/5 p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
                                    <p className={`text-lg font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {member.role}
                                    </p>
                                    <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {member.bio}
                                    </p>
                                    <div className="flex space-x-4">
                                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" 
                                            className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                                            <FaLinkedin size={24} />
                                        </a>
                                        <a href={member.social.github} target="_blank" rel="noopener noreferrer" 
                                            className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}>
                                            <FaGithub size={24} />
                                        </a>
                                        <a href={member.social.email} 
                                            className={`${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                                            <FaEnvelope size={24} />
                                        </a>
                                        <a href={member.social.portfolio} target="_blank" rel="noopener noreferrer" 
                                            className={`${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}>
                                            <FaGlobe size={24} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Our Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`mt-24 p-8 md:p-12 rounded-2xl shadow-lg border ${
                        isDark 
                            ? 'bg-gray-800/90 border-gray-700 shadow-purple-500/10' 
                            : 'bg-white/90 border-gray-100 shadow-purple-500/20'
                    }`}
                >
                    <h2 className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r ${
                        isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
                    } bg-clip-text text-transparent`}>
                        Our Story
                    </h2>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            The "Know India" project was born from our shared passion for India's diverse culture and rich heritage.
                            As software engineers with roots in different parts of India, we wanted to create a platform that showcases
                            the beauty and diversity of our country.
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Our journey began when we realized that many people, including Indians themselves, are unaware of the
                            incredible diversity and cultural richness that exists across different states of India. We decided to 
                            leverage our technical skills to create an interactive and educational platform.
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Today, we continue to expand and improve this platform, adding more detailed information about each state, 
                            its traditions, cuisines, festivals, and landmarks. We hope that through this project, we can inspire 
                            others to explore and appreciate the incredible tapestry that is India.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutUs;
