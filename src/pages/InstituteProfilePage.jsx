import { useState } from 'react';
import { Edit3, Copy, MapPin, Plus, Users } from 'lucide-react';
import logoImage from '../image.src/hu img.jfif';
import bannerImage from '../image.src/banner.jfif';

export default function InstituteProfilePage() {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBanners, setShowBanners] = useState(false);
  const [newFacility, setNewFacility] = useState('');
  const [facilities, setFacilities] = useState(['Hostels', 'Library', 'Laboratories', 'Sports', 'Transport', 'Medical']);
  const [contactPersons, setContactPersons] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    Facebook: 'https://www.facebook.com/HaridwarUniversity/',
    Twitter: 'https://x.com/HURoorkee',
    Google: 'https://huroorkee.ac.in/',
    Instagram: 'https://www.instagram.com/haridwaruniversity',
  });
  const instituteId = '69c40c37ed1446000f164188';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instituteId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.log('copy failed', e);
    }
  };

  const handleEditInstitute = () => {
    setIsEditing((current) => !current);
  };

  const handleToggleBanners = () => {
    setShowBanners((current) => !current);
  };

  const handleSocialChange = (key, value) => {
    setSocialLinks((current) => ({ ...current, [key]: value }));
  };

  const handleVisitLink = (url) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handleLocationClick = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=5th+Km+Roorkee-Haridwar+Canal+Road+Roorkee+Uttarakhand+247667', '_blank');
  };

  const handleFacilityAdd = () => {
    const trimmed = newFacility.trim();
    if (!trimmed) return;
    if (!facilities.includes(trimmed)) {
      setFacilities((current) => [...current, trimmed]);
    }
    setNewFacility('');
  };

  const handleFacilityRemove = (facility) => {
    setFacilities((current) => current.filter((item) => item !== facility));
  };

  const handleAddContactPerson = () => {
    setContactPersons((current) => [
      ...current,
      {
        id: current.length + 1,
        name: `Contact Person ${current.length + 1}`,
        role: 'Administrator',
        phone: `+91 98010${1200 + current.length}`,
      },
    ]);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] p-2.5"> {/* page margin 10px */}
      {/* Top profile header */}
      <div className="rounded-[18px] bg-[#16a34a] border border-transparent shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100">
            <img src={logoImage} alt="logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 rounded-sm bg-white" />
                  <h2 className="text-2xl font-semibold text-white">HARIDWAR UNIVERSITY</h2>
                </div>
                <button type="button" onClick={handleLocationClick} className="mt-2 flex items-center gap-3 text-sm text-slate-100 transition hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white rounded-md hover-gradient-border">
                  <MapPin className="h-4 w-4 text-slate-100" />
                  <span>5th Km. Roorkee-Haridwar Canal Road, Roorkee, Uttarakhand - 247667</span>
                </button>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <div className="rounded-md bg-white px-3 py-1 text-[#16a34a] text-sm font-medium">Active</div>
                </div>
              </div>
                <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 text-sm text-white">
                  <span className="font-medium text-white">{instituteId}</span>
                  <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-md border border-white bg-white/90 px-3 py-1 text-sm text-slate-800 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white hover-gradient-border">
                    <Copy className="h-4 w-4" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <button onClick={handleEditInstitute} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#16a34a] transition hover:bg-[#f0fdfa] focus:outline-none focus:ring-2 focus:ring-white hover-gradient-border">
                  <Edit3 className="h-4 w-4" /> {isEditing ? 'Stop Editing' : 'Edit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-[18px] bg-white border border-slate-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" />
          <h3 className="text-xl font-semibold text-slate-900">About</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ['Name', 'HARIDWAR UNIVERSITY'],
            ['Display Name', 'HARIDWAR UNIVERSITY'],
            ['Principal', 'N A'],
            ['QAC', 'HUR'],
            ['Founding Year', '2010'],
            ['Institute Type', 'university'],
            ['Board / University', 'HARIDWAR UNIVERSITY'],
            ['Website', 'www.huroorkee.ac.in'],
            ['Contact Email', 'info@huroorkee.ac.in'],
            ['Reception Number', '9801012345'],
            ['Medium', 'English'],
            ['Pre-filled Seats', ''],
            ['School ID', ''],
            ['UDISE ID', ''],
            ['CBSE School Code', ''],
            ['CBSE Affiliation Number', ''],
          ].map(([label, value]) => (
            <div key={label} className="pb-3">
              <div className="text-[12px] text-slate-500">{label}</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">{value || <span className="text-slate-400">—</span>}</div>
              <div className="mt-3 border-b border-slate-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Banners */}
      <div className="rounded-[18px] bg-white border border-slate-100 shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" />
            <h3 className="text-xl font-semibold text-slate-900">Institute Banners</h3>
          </div>
          <button onClick={handleToggleBanners} className="inline-flex items-center gap-2 rounded-md bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 hover-gradient-border">{showBanners ? 'Hide Banners' : 'Manage Banners'}</button>
        </div>
        <div className="border-dashed rounded-md border-2 border-slate-100 p-4">
          <div className="w-48 rounded-md overflow-hidden border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="h-28 bg-slate-100 flex items-center justify-center">
              <img src={bannerImage} alt="Haridwar University campus banner" className="h-full w-full object-cover object-center" />
            </div>
            <div className="p-3">
              <div className="font-semibold text-slate-900">Haridwar University Campus</div>
              <div className="text-sm text-slate-500 mt-1">Official aerial view of Haridwar University campus.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Social Media */}
        <div className="rounded-[18px] bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" />
              <h3 className="text-xl font-semibold text-slate-900">Social Media</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(socialLinks).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-slate-500">{key}</div>
                  <button onClick={() => handleVisitLink(value)} className="text-xs font-semibold text-[#16a34a] transition hover:text-[#14532d] focus:outline-none">Open</button>
                </div>
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-100 p-2 text-sm transition focus:border-[#16a34a] focus:ring-[#16a34a]/30 hover-gradient-border"
                  rows={1}
                  value={value}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="rounded-[18px] bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" />
              <h3 className="text-xl font-semibold text-slate-900">Location</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] text-slate-500">Address</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">5th Km. Roorkee-Haridwar Canal Road, Roorkee</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">Landmark</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">Bajuhari</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">City</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">Roorkee</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">State</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">Uttarakhand</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">Postal Code</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">247667</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">Longitude</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">77.8879822</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">Latitude</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">29.8542806</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">Radius</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">in meters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Facilities */}
        <div className="rounded-[18px] bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" />
              <h3 className="text-xl font-semibold text-slate-900">Facilities</h3>
            </div>
          </div>
          <div className="mb-3 flex gap-2">
            <input
              placeholder="New facility..."
              className="flex-1 rounded-md border border-slate-100 p-2 text-sm transition focus:border-[#16a34a] focus:ring-[#16a34a]/30 hover-gradient-border"
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleFacilityAdd())}
            />
            <button
              onClick={handleFacilityAdd}
              className="rounded-md bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 hover-gradient-border"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {facilities.map((f) => (
              <button
                key={f}
                onClick={() => handleFacilityRemove(f)}
                className="rounded-full border border-[#bbf7d0] bg-[#dcfce7] px-4 py-2 text-sm font-medium text-[#166534] transition hover:border-[#16a34a] hover:bg-[#bbf7d0] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30"
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Persons */}
        <div className="rounded-[18px] bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" />
              <h3 className="text-xl font-semibold text-slate-900">Contact Persons</h3>
            </div>
            <button onClick={handleAddContactPerson} className="inline-flex items-center gap-2 rounded-md bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 hover-gradient-border"><Plus className="h-4 w-4" /> Add Contact Person</button>
          </div>
          <div className="min-h-[160px] border border-dashed border-slate-100 rounded-md p-6">
            {contactPersons.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <div className="text-center">
                  <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <div className="font-medium text-slate-700">No contact persons added</div>
                  <div className="text-sm text-slate-500 mt-1">Add a contact person to show them here.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {contactPersons.map((person) => (
                  <div key={person.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{person.name}</div>
                        <div className="text-xs text-slate-500">{person.role}</div>
                      </div>
                      <div className="text-xs text-slate-500">{person.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
