/*
 * AI & Fallback Diagnosis Helper
 * 
 * Provides fallback diagnosis logic when external AI gateways
 * experience downtime (e.g. 503 auth/rate limits), ensuring the application
 * remains 100% resilient and functional.
 */

export interface DiagnosisResult {
  problem: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  repairScore: number;
  worthRepairing: boolean;
  estimatedRepairCost: number;
  estimatedReplaceCost: number;
  impact: {
    co2Saved: number;
    waterSaved: number;
    wastePrevented: number;
  };
  diyGuide: {
    difficulty: "Beginner" | "Intermediate" | "Expert";
    estimatedTime: string;
    tools: string[];
    steps: string[];
    safetyNotes: string;
  };
  spareParts: Array<{
    name: string;
    estimatedCost: number;
    availableAt: string;
    link: string;
  }>;
  repairOptions: Array<{
    option: "DIY" | "Local Shop" | "Authorized Service";
    estimatedCost: number;
    timeEstimate: string;
    pros: string;
    cons: string;
  }>;
}

export function generateFallbackDiagnosis(category: string, description: string): DiagnosisResult {
  const descLower = (description || "").toLowerCase();
  
  // Detect severity from keywords
  let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
  if (/smoke|fire|spark|explosion|burn|shock/i.test(descLower)) {
    severity = "Critical";
  } else if (/shattered|cracked screen|broken motherboard|water damage|leaking heavily|snapped frame/i.test(descLower)) {
    severity = "High";
  } else if (/scratch|cosmetic|loose screw|squeak|dusty|cleaning/i.test(descLower)) {
    severity = "Low";
  }

  const encodedQuery = encodeURIComponent(description.slice(0, 40));

  switch (category.toLowerCase()) {
    case "electronics":
      return {
        problem: `Hardware component issue detected: ${description}`,
        severity,
        repairScore: 82,
        worthRepairing: true,
        estimatedRepairCost: 750,
        estimatedReplaceCost: 6500,
        impact: {
          co2Saved: 18.5,
          waterSaved: 320,
          wastePrevented: 0.85,
        },
        diyGuide: {
          difficulty: "Intermediate",
          estimatedTime: "45-60 mins",
          tools: [
            "Precision screwdriver set (PH000, T4, T5)",
            "Plastic pry opening picks",
            "ESD anti-static tweezers",
            "Isopropanol (IPA 99%) & microfiber cloth",
          ],
          steps: [
            "Power off the device completely and disconnect all power sources / remove battery if possible.",
            "Use a plastic pry tool to carefully unclip the outer casing along the seams.",
            "Inspect internal ribbon cables, solder joints, and modular connectors for loose connections or wear.",
            "Clean contact pads with 99% isopropyl alcohol using a lint-free swab.",
            "Install the replacement component and seat connectors firmly.",
            "Power on to test basic functionality before securing the outer housing with screws.",
          ],
          safetyNotes: "Ensure the device is powered off. Never puncture, bend, or apply direct heat to lithium batteries.",
        },
        spareParts: [
          {
            name: "Replacement Component / Connector Ribbon Module",
            estimatedCost: 600,
            availableAt: "Amazon / Flipkart / Local Spares Market",
            link: `https://www.amazon.in/s?k=${encodedQuery}`,
          },
          {
            name: "Thermal Interface Tape / Precision Electronic Adhesive",
            estimatedCost: 150,
            availableAt: "Amazon / Electronics Store",
            link: "https://www.amazon.in/s?k=electronic+repair+adhesive+tape",
          },
        ],
        repairOptions: [
          {
            option: "DIY",
            estimatedCost: 600,
            timeEstimate: "1 hour",
            pros: "Very cost-effective; builds hands-on electronics repair skills",
            cons: "Requires precision tools and steady handling",
          },
          {
            option: "Local Shop",
            estimatedCost: 1100,
            timeEstimate: "1-2 days",
            pros: "Quick turnaround time, expert technician labor included",
            cons: "Part quality may depend on the specific shop",
          },
          {
            option: "Authorized Service",
            estimatedCost: 2400,
            timeEstimate: "3-5 days",
            pros: "100% genuine OEM components and warranty retention",
            cons: "Higher labor charges and longer turnaround",
          },
        ],
      };

    case "appliance":
      return {
        problem: `Appliance operational fault: ${description}`,
        severity,
        repairScore: 78,
        worthRepairing: true,
        estimatedRepairCost: 1200,
        estimatedReplaceCost: 14000,
        impact: {
          co2Saved: 34.0,
          waterSaved: 500,
          wastePrevented: 5.5,
        },
        diyGuide: {
          difficulty: "Intermediate",
          estimatedTime: "1-2 hours",
          tools: [
            "Adjustable wrench",
            "Digital Multimeter",
            "Socket wrench set",
            "Insulated screwdrivers",
          ],
          steps: [
            "Unplug the appliance from mains power and turn off any attached water or gas valves.",
            "Remove the rear or bottom access panel by unscrewing the mounting fasteners.",
            "Check the drive belt, motor capacitor, heating element, and intake filter for obvious defects.",
            "Use a digital multimeter to test switches and thermal fuses for continuity.",
            "Swap out the damaged part, reconnect wiring harnesses securely according to color code.",
            "Reattach panels, restore power, and execute a short test cycle while observing for leaks.",
          ],
          safetyNotes: "Always disconnect mains power before opening panels. Large capacitors can store charge even when unplugged.",
        },
        spareParts: [
          {
            name: "OEM Replacement Sensor / Valve / Element Assembly",
            estimatedCost: 850,
            availableAt: "Amazon / Local Appliance Spares",
            link: `https://www.amazon.in/s?k=${encodedQuery}`,
          },
          {
            name: "High-Temperature Silicone Seal / Gasket Kit",
            estimatedCost: 350,
            availableAt: "Amazon / Hardware Store",
            link: "https://www.amazon.in/s?k=appliance+seal+gasket",
          },
        ],
        repairOptions: [
          {
            option: "DIY",
            estimatedCost: 850,
            timeEstimate: "2 hours",
            pros: "Saves high home-visit service fees",
            cons: "Bulky components and troubleshooting require care",
          },
          {
            option: "Local Shop",
            estimatedCost: 1500,
            timeEstimate: "Same day / 1 day",
            pros: "Home technician visits available, fast resolution",
            cons: "Technician experience level varies",
          },
          {
            option: "Authorized Service",
            estimatedCost: 3200,
            timeEstimate: "2-4 days",
            pros: "Certified company technician and OEM parts guarantee",
            cons: "Higher consultation and inspection fees",
          },
        ],
      };

    case "bicycle":
      return {
        problem: `Mechanical wear / alignment issue: ${description}`,
        severity,
        repairScore: 92,
        worthRepairing: true,
        estimatedRepairCost: 400,
        estimatedReplaceCost: 8500,
        impact: {
          co2Saved: 8.5,
          waterSaved: 120,
          wastePrevented: 3.2,
        },
        diyGuide: {
          difficulty: "Beginner",
          estimatedTime: "30-45 mins",
          tools: [
            "Hex / Allen wrench set (4mm, 5mm, 6mm)",
            "Tire levers & floor pump",
            "Bicycle degreaser & chain lubricant",
            "Clean shop rag",
          ],
          steps: [
            "Secure the bicycle upright on a stand or gently invert it onto the handlebar and seat.",
            "Inspect the affected brake assembly, gear derailleur, chain, or wheel hub.",
            "Clean dirt and old grime from moving joints with degreaser and a stiff brush.",
            "Adjust cable tension using the barrel adjusters until shifting/braking engages cleanly.",
            "Apply synthetic chain lube to each link, then wipe off excess oil with a clean rag.",
            "Perform a stationary test spin followed by a gentle test ride to verify brake bite.",
          ],
          safetyNotes: "Always test brake function and tire pressure thoroughly before riding on roads.",
        },
        spareParts: [
          {
            name: "Stainless Steel Brake / Gear Cable & Housing Set",
            estimatedCost: 250,
            availableAt: "Decathlon / Amazon / Local Bike Shop",
            link: `https://www.amazon.in/s?k=${encodedQuery}`,
          },
          {
            name: "All-Weather Synthetic Bicycle Chain Lubricant",
            estimatedCost: 150,
            availableAt: "Decathlon / Amazon",
            link: "https://www.amazon.in/s?k=bicycle+chain+lube",
          },
        ],
        repairOptions: [
          {
            option: "DIY",
            estimatedCost: 250,
            timeEstimate: "45 mins",
            pros: "Easy to perform with basic hand tools, zero labor cost",
            cons: "Fine-tuning derailleurs takes some patience",
          },
          {
            option: "Local Shop",
            estimatedCost: 500,
            timeEstimate: "Same day",
            pros: "Very fast service and complete safety check",
            cons: "Need to bring the bike to the shop",
          },
          {
            option: "Authorized Service",
            estimatedCost: 950,
            timeEstimate: "1-2 days",
            pros: "Full multi-point tune-up and ultrasonic cleaning",
            cons: "Higher labor charges for simple repairs",
          },
        ],
      };

    case "furniture":
      return {
        problem: `Structural / cosmetic furniture defect: ${description}`,
        severity,
        repairScore: 86,
        worthRepairing: true,
        estimatedRepairCost: 500,
        estimatedReplaceCost: 7500,
        impact: {
          co2Saved: 24.0,
          waterSaved: 420,
          wastePrevented: 11.5,
        },
        diyGuide: {
          difficulty: "Beginner",
          estimatedTime: "1 hour (+ drying time)",
          tools: [
            "Wood glue (PVA / Polyurethane adhesive)",
            "Bar clamps or ratcheting strap clamps",
            "Sandpaper assortment (120 & 240 grit)",
            "Wood filler / touch-up marker",
          ],
          steps: [
            "Clean the joint or surface thoroughly, scraping away old dry glue and dust.",
            "Dry-fit the joint components together to ensure flush, tight alignment.",
            "Apply a generous, even layer of wood glue across both mating surfaces.",
            "Join the pieces firmly and secure with clamps. Wipe off any excess squeeze-out with a damp rag.",
            "Allow glue to cure undisturbed for 12 to 24 hours under clamp pressure.",
            "Lightly sand the repaired area and blend with wood filler or matching stain polish.",
          ],
          safetyNotes: "Ensure good room ventilation when using wood glues, fillers, or chemical stains.",
        },
        spareParts: [
          {
            name: "High-Bond PVA Wood Adhesive & Dowel Pins",
            estimatedCost: 250,
            availableAt: "Hardware Store / Amazon",
            link: `https://www.amazon.in/s?k=${encodedQuery}`,
          },
          {
            name: "Wood Filler & Color Touch-Up Blending Crayons",
            estimatedCost: 250,
            availableAt: "Hardware Store / Amazon",
            link: "https://www.amazon.in/s?k=wood+filler+touch+up",
          },
        ],
        repairOptions: [
          {
            option: "DIY",
            estimatedCost: 250,
            timeEstimate: "1 hour",
            pros: "Low cost, satisfying results with standard household tools",
            cons: "Requires waiting for glue to fully cure",
          },
          {
            option: "Local Shop",
            estimatedCost: 750,
            timeEstimate: "1 day",
            pros: "Professional carpentry finish and reinforced joints",
            cons: "Moving furniture to carpenter workshop",
          },
          {
            option: "Authorized Service",
            estimatedCost: 1600,
            timeEstimate: "2-3 days",
            pros: "Exact factory upholstery or finish match",
            cons: "High cost relative to the repair complexity",
          },
        ],
      };

    default: // "other"
      return {
        problem: `General item diagnosis: ${description}`,
        severity,
        repairScore: 80,
        worthRepairing: true,
        estimatedRepairCost: 600,
        estimatedReplaceCost: 4500,
        impact: {
          co2Saved: 14.0,
          waterSaved: 200,
          wastePrevented: 2.2,
        },
        diyGuide: {
          difficulty: "Intermediate",
          estimatedTime: "45 mins",
          tools: [
            "Multi-bit screwdriver & pliers",
            "Epoxy adhesive / Industrial bonding glue",
            "Cleaning solvent & cloth",
            "Protective work gloves",
          ],
          steps: [
            "Inspect the damaged area and determine if parts are cracked, misaligned, or detached.",
            "Clean the surface of any grease, oil, dust, or moisture.",
            "Apply the appropriate bonding agent or tighten mechanical fasteners.",
            "Clamp or hold firmly in place until the bond sets according to product instructions.",
            "Verify structural integrity and test under normal load before full usage.",
          ],
          safetyNotes: "Wear protective gloves and eye protection when handling strong adhesives or sharp tools.",
        },
        spareParts: [
          {
            name: "Universal Hardware Fastener / Epoxy Repair Kit",
            estimatedCost: 350,
            availableAt: "Hardware Store / Amazon",
            link: `https://www.amazon.in/s?k=${encodedQuery}`,
          },
          {
            name: "Reinforced Multi-Purpose Repair Tape",
            estimatedCost: 250,
            availableAt: "Hardware Store / Amazon",
            link: "https://www.amazon.in/s?k=heavy+duty+repair+tape",
          },
        ],
        repairOptions: [
          {
            option: "DIY",
            estimatedCost: 350,
            timeEstimate: "45 mins",
            pros: "Quick and cost-effective fix at home",
            cons: "May require basic trial and error",
          },
          {
            option: "Local Shop",
            estimatedCost: 850,
            timeEstimate: "1 day",
            pros: "Handled by an experienced technician with specialized tools",
            cons: "Service labor fee",
          },
          {
            option: "Authorized Service",
            estimatedCost: 1800,
            timeEstimate: "2-4 days",
            pros: "Official certification and warranty compliance",
            cons: "Highest price point",
          },
        ],
      };
  }
}
