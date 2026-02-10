import React from "react";
import Chart from "react-apexcharts";

const VisitorsAreaCard = () => {
  const series = [
    {
      name: "Visitors",
      data: [180, 51, 60, 38, 88, 50, 40, 52, 88, 80, 60, 70],
    },
  ];

  const options = {
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    grid: {
      strokeDashArray: 2,
      borderColor: "#374151",
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.1,
        opacityTo: 0.8,
        stops: [0, 90, 100],
      },
    },
    colors: ["#4f46e5"], // indigo-600
    xaxis: {
      type: "category",
      categories: [
        "25 January 2023",
        "26 January 2023",
        "27 January 2023",
        "28 January 2023",
        "29 January 2023",
        "30 January 2023",
        "31 January 2023",
        "1 February 2023",
        "2 February 2023",
        "3 February 2023",
        "4 February 2023",
        "5 February 2023",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: "13px",
          fontFamily: "Inter, ui-sans-serif",
          color: "#94a3b8",
        },
        formatter: (val) => {
          if (!val) return val;
          const parts = val.split(" ");
          return `${parts[0]} ${parts[1].slice(0, 3)}`;
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => (val >= 1000 ? `${val / 1000}k` : val),
        style: {
          fontSize: "13px",
          fontFamily: "Inter, ui-sans-serif",
          color: "#94a3b8",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) =>
          val >= 1000 ? `${val / 1000}k` : val,
      },
      theme: "dark",
    },
    responsive: [
      {
        breakpoint: 568,
        options: {
          xaxis: {
            labels: {
              style: { fontSize: "11px", color: "#94a3b8" },
            },
          },
          yaxis: {
            labels: {
              style: { fontSize: "11px", color: "#94a3b8" },
            },
          },
        },
      },
    ],
  };

  return (
    <div className="p-4 md:p-5 min-h-[410px] flex flex-col bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl w-1/2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm text-slate-400">
            Visitors
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-white">
            80.3k
          </p>
        </div>

        <span className="py-1 px-2 inline-flex items-center gap-1 text-xs font-medium rounded-md bg-indigo-500/10 text-indigo-400">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
          2%
        </span>
      </div>

      {/* Chart */}
      <Chart
        options={options}
        series={series}
        type="area"
        height={300}
      />
    </div>
  );
};

export default VisitorsAreaCard;

