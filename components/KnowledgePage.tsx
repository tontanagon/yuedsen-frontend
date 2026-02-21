"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ========== DATA ==========

interface Reference {
    institution: string;
    country: string;
    description: string;
    url: string;
    linkLabel: string;
}

interface Zone {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    gradient: string;
    references: Reference[];
}

const zones: Zone[] = [
    {
        id: "neck",
        icon: "🪄",
        title: "โซนคอ-บ่า-หลัง",
        subtitle: "Office Syndrome & Upper Crossed Syndrome",
        gradient: "from-[#53A0DF] to-[#3B80C0]",
        references: [
            {
                institution: "โรงพยาบาลวิมุต (Vimut Hospital)",
                country: "🇹🇭 ไทย",
                description:
                    "บทความ 9 ท่าบริหารแก้ออฟฟิศซินโดรม ลดอาการปวดคอ บ่า ไหล่ แนะนำท่า Chin Tuck และท่ายืดคอ-บ่าที่ตรงกับในแอป",
                url: "https://www.vimut.com/article/9-stretching-exercises-for-office-syndrome",
                linkLabel: "vimut.com",
            },
            {
                institution: "รามาแชนแนล — คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี",
                country: "🇹🇭 ไทย",
                description:
                    "บทความ ท่ายืดออกกำลังกาย ป้องกันออฟฟิศซินโดรม แนะนำท่าประสานมือท้ายทอยและการยืดหลัง",
                url: "https://www.rama.mahidol.ac.th/ramachannel/infographic/",
                linkLabel: "rama.mahidol.ac.th",
            },
            {
                institution: "โรงพยาบาลศิริราช ปิยมหาราชการุณย์",
                country: "🇹🇭 ไทย",
                description:
                    "เอกสารแนะนำท่าทางการยืดกล้ามเนื้อที่ถูกวิธีเพื่อรักษาและป้องกันออฟฟิศซินโดรม",
                url: "https://siphhospital.com/th/news/article/share/724",
                linkLabel: "siphhospital.com",
            },
            {
                institution: "โรงพยาบาล kdms (ข้อดีมีสุข)",
                country: "🇹🇭 ไทย",
                description:
                    "บทความ รักษาออฟฟิศซินโดรมด้วยการปรับพฤติกรรมการนั่งทำงาน อธิบายหลักสรีรศาสตร์ (Ergonomics) ที่ AI ของเราใช้จับองศาข้อต่อ",
                url: "https://kdmshospital.com/article/office-syndrome-posture/",
                linkLabel: "kdmshospital.com",
            },
            {
                institution: "โรงพยาบาลพระรามเก้า (Praram 9 Hospital)",
                country: "🇹🇭 ไทย",
                description:
                    "ออฟฟิศซินโดรม อาการเรื้อรังที่ต้องรีบรักษา อธิบายการรักษาด้วยการปรับสรีระและการยืดเหยียดกล้ามเนื้ออย่างสม่ำเสมอ",
                url: "https://praram9.com/th/articles/officesyndrome",
                linkLabel: "praram9.com",
            },
        ],
    },
    {
        id: "hip",
        icon: "🦵",
        title: "โซนสะโพกและขา",
        subtitle: "Piriformis Syndrome (สลักเพชรจม)",
        gradient: "from-[#ED8C57] to-[#E3662A]",
        references: [
            {
                institution: "โรงพยาบาล kdms (ข้อดีมีสุข)",
                country: "🇹🇭 ไทย",
                description:
                    "อธิบายกลไกโรคสลักเพชรจม พร้อมแนะนำท่า Lying/Seated Figure 4 Stretch อย่างชัดเจน ตรงกับท่าในแอปของเรา",
                url: "https://kdmshospital.com/article/piriformis-syndrome/",
                linkLabel: "kdmshospital.com",
            },
            {
                institution: "โรงพยาบาลสมิติเวช (Samitivej Hospital)",
                country: "🇹🇭 ไทย",
                description:
                    "5 ท่าบริหารแก้สลักเพชรจม หนึ่งในนั้นคือท่ายกข้อเท้าพาดเข่าอีกข้างแล้วดึงเข้าหาตัว กลไกเดียวกับ Seated Figure 4",
                url: "https://www.samitivejhospitals.com/th/article/detail/",
                linkLabel: "samitivejhospitals.com",
            },
            {
                institution: "Cleveland Clinic",
                country: "🇺🇸 สหรัฐอเมริกา",
                description:
                    "บทความ Piriformis Syndrome แนะนำการยืดกล้ามเนื้อ Piriformis ด้วยท่าดึงเข่าชิดอก (Knee to chest) และการพับสะโพก",
                url: "https://my.clevelandclinic.org/health/diseases/23495-piriformis-syndrome",
                linkLabel: "clevelandclinic.org",
            },
        ],
    },
    {
        id: "wrist",
        icon: "🖐️",
        title: "โซนข้อมือและแขน",
        subtitle: "Carpal Tunnel Syndrome",
        gradient: "from-[#9F7AEA] to-[#6B46C1]",
        references: [
            {
                institution: "Mayo Clinic",
                country: "🇺🇸 สหรัฐอเมริกา",
                description:
                    "ระบุชัดเจนว่าการยืดฝ่ามือ-นิ้ว และ Nerve-gliding exercises ช่วยบรรเทาอาการในผู้ป่วยระยะเริ่มต้น",
                url: "https://www.mayoclinic.org/diseases-conditions/carpal-tunnel-syndrome/diagnosis-treatment/drc-20355608",
                linkLabel: "mayoclinic.org",
            },
            {
                institution: "The Chartered Society of Physiotherapy (CSP)",
                country: "🇬🇧 สหราชอาณาจักร",
                description:
                    "เอกสารแนะนำท่าบริหารสำหรับผู้ป่วย Carpal Tunnel Syndrome รวมถึงท่าดัดข้อมือและแขน",
                url: "https://www.csp.org.uk/public-patient/rehabilitation-exercises/carpal-tunnel-syndrome",
                linkLabel: "csp.org.uk",
            },
            {
                institution: "American Academy of Orthopaedic Surgeons (AAOS)",
                country: "🇺🇸 สหรัฐอเมริกา",
                description:
                    "คู่มือ PDF โปรแกรมการออกกำลังกายบำบัดข้อมืออย่างเป็นทางการ โดยสมาคมศัลยศาสตร์กระดูกและข้อแห่งอเมริกา",
                url: "https://orthoinfo.aaos.org/globalassets/pdfs/a00789_therapeutic-exercise-program-for-carpal-tunnel_final.pdf",
                linkLabel: "orthoinfo.aaos.org (PDF)",
            },
        ],
    },
    {
        id: "eyes",
        icon: "👁️",
        title: "โซนสายตา",
        subtitle: "Computer Vision Syndrome (ตาล้าจากจอ)",
        gradient: "from-[#48BB78] to-[#2A7A4E]",
        references: [
            {
                institution: "American Optometric Association (AOA)",
                country: "🇺🇸 สหรัฐอเมริกา",
                description:
                    "ผู้บัญญัติ Computer Vision Syndrome และกฎ 20-20-20 Rule (ทำงาน 20 นาที พักสายตา 20 วินาที มองออกไปไกล 20 ฟุต) ซึ่งนำมาใช้ใน Focus Shift ของแอป",
                url: "https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome",
                linkLabel: "aoa.org",
            },
            {
                institution: "National Institutes of Health (NIH)",
                country: "🇺🇸 สหรัฐอเมริกา",
                description:
                    "คู่มือ Exercises and Stretches สำหรับคนทำงานหน้าคอมพิวเตอร์ มีหมวด Eye Exercises รวมถึงท่าเปลี่ยนจุดโฟกัส ตรงกับท่า Focus Shift ในแอป",
                url: "https://ors.od.nih.gov/sr/dohs/HealthAndWellness/Ergonomics/Pages/exercises.aspx",
                linkLabel: "nih.gov",
            },
        ],
    },
];

interface TimeRef {
    institution: string;
    country: string;
    claim: string;
    description: string;
    url: string;
    linkLabel: string;
}

const timeReferences: TimeRef[] = [
    {
        institution: "Harvard Medical School",
        country: "🇺🇸 สหรัฐอเมริกา",
        claim: "ค้างท่า 30 วินาที",
        description:
            "บทความ The importance of stretching ระบุชัดว่า Hold a stretch for 30 seconds. เพื่อให้กล้ามเนื้อคลายตัวอย่างปลอดภัย",
        url: "https://www.health.harvard.edu/staying-healthy/the-importance-of-stretching",
        linkLabel: "health.harvard.edu",
    },
    {
        institution: "American College of Sports Medicine (ACSM)",
        country: "🇺🇸 สหรัฐอเมริกา",
        claim: "ค้างท่า 10-30 วินาที",
        description:
            "มาตรฐานสากลที่กำหนดโดย ACSM: Static stretches should be held for 10 to 30 seconds. กลายเป็นรากฐานของกายภาพบำบัดทั่วโลก",
        url: "https://www.aafp.org/pubs/afp/issues/1999/0115/p473.html",
        linkLabel: "aafp.org",
    },
    {
        institution: "Exercise is Medicine (EIM) by ACSM",
        country: "🇺🇸 สหรัฐอเมริกา",
        claim: "ทำ 10-15 ครั้ง",
        description:
            "แนะนำ 10 to 15 repetitions สำหรับสร้างความทนทานกล้ามเนื้อ (Muscle Endurance) เหมาะสำหรับคนทำงานออฟฟิศโดยเฉพาะ",
        url: "https://www.exerciseismedicine.org/apparently-healthy-inactive-person/",
        linkLabel: "exerciseismedicine.org",
    },
    {
        institution: "Canadian Centre for Occupational Health and Safety (CCOHS)",
        country: "🇨🇦 แคนาดา",
        claim: "ค้างท่า 10-20 วินาที",
        description:
            "บทความ Office Ergonomics - Stretching อธิบาย Stretching Protocol ที่ถูกต้อง ทั้งเวลาค้างท่าและท่า Shoulder Shrug, Chest Stretch, Back Flexion",
        url: "https://www.ccohs.ca/oshanswers/ergonomics/office/stretching.html",
        linkLabel: "ccohs.ca",
    },
];

// ========== SUB-COMPONENTS ==========

function ExternalLinkIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}

function ReferenceCard({ item }: { item: Reference }) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <p className="font-bold text-gray-800 text-sm leading-tight">{item.institution}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">{item.country}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.description}</p>
            <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
                <ExternalLinkIcon />
                {item.linkLabel}
            </a>
        </div>
    );
}

function TimeRefCard({ item }: { item: TimeRef }) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                {item.claim}
            </span>
            <p className="font-bold text-gray-800 text-sm">{item.institution}</p>
            <p className="text-xs text-gray-400 mb-2">{item.country}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.description}</p>
            <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
                <ExternalLinkIcon />
                {item.linkLabel}
            </a>
        </div>
    );
}

// ========== MAIN PAGE ==========

export default function KnowledgePage() {
    const router = useRouter();
    const [activeZone, setActiveZone] = useState<string>("neck");

    const currentZone = zones.find((z) => z.id === activeZone);

    return (
        <div
            className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/background_home.png')" }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-10 pb-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-md flex items-center justify-center border border-white/80 hover:bg-white/90 transition-all duration-200 active:scale-95"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-[#2A6546]">แหล่งความรู้</h1>
                    <p className="text-xs text-gray-500">อ้างอิงทางการแพทย์และวิทยาศาสตร์การกีฬา</p>
                </div>
            </div>

            {/* Zone Tabs */}
            <div className="px-4 mb-4">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-white/70 flex gap-1 overflow-x-auto">
                    {zones.map((z) => (
                        <button
                            key={z.id}
                            onClick={() => setActiveZone(z.id)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${activeZone === z.id
                                    ? `bg-gradient-to-br ${z.gradient} text-white shadow-md`
                                    : "text-gray-500 hover:bg-white/60"
                                }`}
                        >
                            <span>{z.icon}</span>
                            <span>{z.title.replace("โซน", "")}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setActiveZone("time")}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${activeZone === "time"
                                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md"
                                : "text-gray-500 hover:bg-white/60"
                            }`}
                    >
                        <span>⏱️</span>
                        <span>เวลา / ครั้ง</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-10 overflow-y-auto">
                {activeZone !== "time" && currentZone ? (
                    <>
                        <div className={`bg-gradient-to-br ${currentZone.gradient} rounded-2xl p-4 mb-4 shadow-lg`}>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{currentZone.icon}</span>
                                <div>
                                    <h2 className="font-extrabold text-white text-lg leading-tight">{currentZone.title}</h2>
                                    <p className="text-white/80 text-xs mt-0.5">{currentZone.subtitle}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {currentZone.references.map((ref, i) => (
                                <ReferenceCard key={i} item={ref} />
                            ))}
                        </div>
                    </>
                ) : activeZone === "time" ? (
                    <>
                        <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 mb-4 shadow-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">⏱️</span>
                                <div>
                                    <h2 className="font-extrabold text-white text-lg leading-tight">เวลาและจำนวนครั้ง</h2>
                                    <p className="text-white/80 text-xs mt-0.5">ค้างท่า 10-30 วินาที | ทำ 10-15 ครั้ง</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {timeReferences.map((ref, i) => (
                                <TimeRefCard key={i} item={ref} />
                            ))}
                        </div>
                    </>
                ) : null}

                {/* Disclaimer */}
                <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                        📋 ข้อมูลทั้งหมดอ้างอิงจากสถาบันการแพทย์และองค์กรวิทยาศาสตร์การกีฬาชั้นนำ
                        <br />
                        กรุณาปรึกษาแพทย์หรือนักกายภาพบำบัดก่อนเริ่มโปรแกรมออกกำลังกาย
                    </p>
                </div>
            </div>
        </div>
    );
}
