import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    whatsapp_number: "",
    instagram_handle: "",
    description: "",
    address: "",
    logo_url: "",
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeSection, setActiveSection] = useState("business");

  const fileInputRef = useRef(null);

  // Fetch profile data from Supabase
  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        // If no profile exists, create one
        if (fetchError.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          if (insertError) throw insertError;

          // Try fetching again after insert
          const { data: newData, error: newFetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (newFetchError) throw newFetchError;

          setFormData({
            business_name: newData.business_name || "",
            owner_name: newData.owner_name || "",
            email: newData.email || user.email || "",
            whatsapp_number: newData.whatsapp_number || "",
            instagram_handle: newData.instagram_handle || "",
            description: newData.description || "",
            address: newData.address || "",
            logo_url: newData.logo_url || "",
          });
          setLogoPreview(newData.logo_url || null);
          return;
        }
        throw fetchError;
      }

      // Update form with fetched data
      setFormData({
        business_name: data.business_name || "",
        owner_name: data.owner_name || "",
        email: data.email || user.email || "",
        whatsapp_number: data.whatsapp_number || "",
        instagram_handle: data.instagram_handle || "",
        description: data.description || "",
        address: data.address || "",
        logo_url: data.logo_url || "",
      });
      setLogoPreview(data.logo_url || null);
    } catch (err) {
      console.error("Error fetching profile:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Profile change detected:", payload);
          fetchProfile(); // Refresh profile on any change
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear success message on change
    setSuccess(false);
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    try {
      setUploadingLogo(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("business-logos")
        .getPublicUrl(filePath);

      // Update form data with new logo URL
      setFormData((prev) => ({
        ...prev,
        logo_url: urlData.publicUrl,
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error uploading logo:", err.message);
      alert("Failed to upload logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({
      ...prev,
      logo_url: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Save button clicked");
    console.log("User:", user);
    console.log("Form data:", formData);

    if (!user) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Prepare profile data - only include fields that exist in the database
      const profileData = {
        business_name: formData.business_name || null,
        owner_name: formData.owner_name || null,
        whatsapp_number: formData.whatsapp_number || null,
        instagram_handle: formData.instagram_handle || null,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        address: formData.address || null,
        updated_at: new Date().toISOString(),
      };

      console.log("Updating profile with data:", profileData);
      console.log("User ID:", user.id);

      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      console.log("Existing profile check:", existingProfile, checkError);

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let result;
      if (!existingProfile) {
        // Profile doesn't exist, create it
        console.log("Creating new profile...");
        result = await supabase.from("profiles").insert([
          {
            id: user.id,
            email: user.email,
            ...profileData,
          },
        ]);
      } else {
        // Profile exists, update it
        console.log("Updating existing profile...");
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id)
          .select();
      }

      const { data, error: updateError } = result;

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      console.log("Save successful:", data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      console.error("Error details:", err.message, err.details, err.hint);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-slate-400 mt-4 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      {/* Profile Header Banner */}
      <div className="relative mb-8">
        {/* Solid Banner - matches form background */}
        <div className="h-48 bg-gray-900/50 backdrop-blur-xl border border-white/5 relative overflow-hidden">
          {/* Content */}
          <div className="absolute inset-0 flex items-end p-8">
            <div className="flex items-end gap-6">
              {/* Logo */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                {/* Edit badge */}
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload-header"
                  />
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>

              {/* Business Info */}
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-white mb-1">
                  {formData.business_name || "Your Business"}
                </h1>
                <p className="text-white/70 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {formData.owner_name || "Add your name"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-emerald-400 font-medium">
            Profile saved successfully!
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-red-400 font-medium">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Tabs */}
          <div className="flex gap-2 p-1.5 bg-gray-900/50 rounded-xl backdrop-blur-sm">
            {[
              {
                id: "business",
                label: "Business",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              },
              {
                id: "contact",
                label: "Contact",
                icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              },
              {
                id: "social",
                label: "Social",
                icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeSection === tab.id
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={tab.icon}
                  />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSave}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/5 p-6"
          >
            {/* Business Section */}
            {activeSection === "business" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Business Information
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Tell customers about your business
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Business Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                              className="w-5 h-5 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all"
                            placeholder="e.g., Handmade Treasures"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Owner Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="owner_name"
                          value={formData.owner_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all"
                          placeholder="Your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-800/30 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Business Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all resize-none"
                        rows="4"
                        placeholder="Tell customers what makes your products special..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === "contact" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Contact Details
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    How customers can reach you
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-green-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="whatsapp_number"
                          value={formData.whatsapp_number}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-gray-800 transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        This number will be shared with customers for orders
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Business Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 pt-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all resize-none"
                          rows="3"
                          placeholder="Your workshop or pickup address"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Section */}
            {activeSection === "social" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Social Media
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Connect your social profiles
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Instagram Handle
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-pink-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      {/* <div className="absolute inset-y-0 left-0 pl-12 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">@</span>
                      </div> */}
                      <input
                        type="text"
                        name="instagram_handle"
                        value={formData.instagram_handle}
                        onChange={handleChange}
                        className="w-full pl-14 pr-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-gray-800 transition-all"
                        placeholder="your_handle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Profile Completion
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your profile is</span>
                <span className="text-emerald-400 font-semibold">
                  {Math.round(
                    ((!!formData.business_name +
                      !!formData.owner_name +
                      !!formData.whatsapp_number +
                      !!formData.instagram_handle +
                      !!formData.description +
                      !!formData.address +
                      !!logoPreview) /
                      7) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((!!formData.business_name + !!formData.owner_name + !!formData.whatsapp_number + !!formData.instagram_handle + !!formData.description + !!formData.address + !!logoPreview) / 7) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
              {[
                { label: "Business Name", filled: !!formData.business_name },
                { label: "Owner Name", filled: !!formData.owner_name },
                { label: "WhatsApp", filled: !!formData.whatsapp_number },
                { label: "Instagram", filled: !!formData.instagram_handle },
                { label: "Description", filled: !!formData.description },
                { label: "Address", filled: !!formData.address },
                { label: "Logo", filled: !!logoPreview },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${item.filled ? "bg-emerald-500/20" : "bg-gray-800"}`}
                  >
                    {item.filled ? (
                      <svg
                        className="w-3 h-3 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm ${item.filled ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          {/* <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Pro Tips</h4>
                <p className="text-sm text-slate-400">Add a business description to help customers understand what makes your products unique.</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Settings;
