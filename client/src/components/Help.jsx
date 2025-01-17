






































import React from 'react';
import { Mail, Book, MessageCircle, ExternalLink, FileQuestion, Phone } from 'lucide-react';

const Help = () => {
    const helpItems = [
        {
            title: 'Documentation',
            description: 'Read our detailed documentation to learn how to use all features.',
            icon: <Book className="w-6 h-6"/>,
            link: '#'
        },
        {
            title: 'FAQ',
            description: 'Find answers to commonly asked questions about our platform.',
            icon: <FileQuestion className="w-6 h-6"/>,
            link: '#'
        },
        {
            title: 'Contact Support',
            description: 'Get in touch with our support team for assistance.',
            icon: <Mail className="w-6 h-6"/>,
            link: '#'
        },
        {
            title: 'Live Chat',
            description: 'Chat with our support team in real-time.',
            icon: <MessageCircle className="w-6 h-6"/>,
            link: '#'
        },
        {
            title: 'Phone Support',
            description: 'Call us directly for immediate assistance.',
            icon: <Phone className="w-6 h-6"/>,
            link: '#'
        }
    ];

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center mt-7 mb-6">
                <h1 className="text-3xl font-semibold">Help & Support</h1>
            </div>

            <hr className="w-full border-gray-300 my-2"/>

            <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {helpItems.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-[#6D70E0]">
                                    {item.icon}
                                </div>
                                <h2 className="text-xl font-semibold">{item.title}</h2>
                            </div>
                            <p className="text-gray-600 mb-4">{item.description}</p>
                            <a
                                href={item.link}
                                className="text-[#6D70E0] hover:underline flex items-center gap-2"
                            >
                                Learn More <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 p-6 bg-indigo-50 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Need Additional Help?</h2>
                <p className="text-gray-600 mb-6">
                    Our support team is available 24/7 to assist you with any questions or concerns you may have.
                </p>
                <button className="bg-[#6D70E0] text-white px-6 py-2 rounded-lg hover:bg-[#5456B3] transition-colors">
                    Contact Us
                </button>
            </div>
        </div>
    );
};

export default Help;