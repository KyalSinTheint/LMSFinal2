import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Eye,
  EyeOff,
  UserPlus,
  Tag,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { Channel } from '../../types/lms';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

export const ChannelManagement: React.FC = () => {
  const {
    channels,
    courses,
    profiles,
    channelAccesses,
    createChannel,
    updateChannel,
    deleteChannel,
    assignChannel,
    revokeChannel,
  } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelForUsers, setSelectedChannelForUsers] = useState<Channel | null>(null);

  // Edit / Create Channel modal state
  const [channelModal, setChannelModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    channelId?: string;
    course_id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    order_index: number;
    published: boolean;
    tagsText: string;
    highlightsText: string;
  }>({
    isOpen: false,
    isEditing: false,
    course_id: '',
    title: '',
    description: '',
    thumbnail_url: '',
    order_index: 1,
    published: true,
    tagsText: '',
    highlightsText: '',
  });

  // Assign user to channel modal state
  const [assignUserModal, setAssignUserModal] = useState<{
    isOpen: boolean;
    channelId: string;
    selectedUserId: string;
    expiresAt: string;
    note: string;
  }>({
    isOpen: false,
    channelId: '',
    selectedUserId: '',
    expiresAt: '',
    note: '',
  });

  const filteredChannels = channels.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lock background scroll when modal or user drawer is open
  useBodyScrollLock(channelModal.isOpen || assignUserModal.isOpen || !!selectedChannelForUsers);

  const handleOpenCreateModal = () => {
    setChannelModal({
      isOpen: true,
      isEditing: false,
      course_id: courses[0]?.id || '',
      title: '',
      description: '',
      thumbnail_url:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      order_index: channels.length + 1,
      published: true,
      tagsText: 'KBZLife Channel, Branch Operations, Advisor Standards',
      highlightsText: 'Ethical Consultation Framework\nDigital Workflow Execution',
    });
  };

  const handleOpenEditModal = (channel: Channel) => {
    setChannelModal({
      isOpen: true,
      isEditing: true,
      channelId: channel.id,
      course_id: channel.course_id || '',
      title: channel.title,
      description: channel.description,
      thumbnail_url: channel.thumbnail_url,
      order_index: channel.order_index,
      published: channel.published,
      tagsText: channel.tags ? channel.tags.join(', ') : '',
      highlightsText: channel.key_highlights ? channel.key_highlights.join('\n') : '',
    });
  };

  const handleSaveChannel = async () => {
    const tags = channelModal.tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const highlights = channelModal.highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (channelModal.isEditing && channelModal.channelId) {
      await updateChannel(channelModal.channelId, {
        course_id: channelModal.course_id || null,
        title: channelModal.title,
        description: channelModal.description,
        thumbnail_url: channelModal.thumbnail_url,
        order_index: Number(channelModal.order_index),
        published: channelModal.published,
        tags,
        key_highlights: highlights,
      });
    } else {
      await createChannel({
        course_id: channelModal.course_id || null,
        title: channelModal.title,
        description: channelModal.description,
        thumbnail_url: channelModal.thumbnail_url,
        order_index: Number(channelModal.order_index),
        published: channelModal.published,
        tags,
        key_highlights: highlights,
      });
    }

    setChannelModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleTogglePublish = async (channel: Channel) => {
    await updateChannel(channel.id, { published: !channel.published });
  };

  const handleAssignUser = async () => {
    if (!assignUserModal.selectedUserId || !assignUserModal.channelId) return;
    await assignChannel(
      assignUserModal.selectedUserId,
      assignUserModal.channelId,
      assignUserModal.expiresAt || null,
      assignUserModal.note
    );
    setAssignUserModal((prev) => ({ ...prev, isOpen: false, note: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#176B98]" />
            <span>Channel Management & Access Authorization</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure learning channels, card highlights, and grant channel permissions for the one-channel-at-a-time user viewer.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Channel</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search learning channels by title or description..."
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredChannels.map((channel) => {
          const accesses = channelAccesses.filter(
            (ca) => ca.channel_id === channel.id && ca.status === 'granted'
          );
          const parentCourse = courses.find((c) => c.id === channel.course_id);

          return (
            <div
              key={channel.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-colors"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={channel.thumbnail_url}
                    alt={channel.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#176B98]/90 text-white backdrop-blur-xs">
                      Channel #{channel.order_index}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-xs ${
                        channel.published
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-amber-600/90 text-white'
                      }`}
                    >
                      {channel.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {parentCourse && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs max-w-[80%] truncate">
                      <BookOpen className="w-3 h-3 text-sky-300 shrink-0" />
                      <span className="truncate">Linked: {parentCourse.title}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {channel.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {channel.description}
                  </p>

                  {/* Highlights */}
                  {channel.key_highlights && channel.key_highlights.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block tracking-wider">
                        Key Directives:
                      </span>
                      {channel.key_highlights.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-[#176B98] font-bold">●</span>
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {channel.tags && channel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {channel.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-[#176B98] border border-sky-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                {/* Users with access button */}
                <button
                  onClick={() => setSelectedChannelForUsers(channel)}
                  className="flex items-center gap-1.5 text-[#176B98] font-bold hover:underline cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{accesses.length} Authorized Users</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(channel)}
                    title={channel.published ? 'Unpublish Channel' : 'Publish Channel'}
                    className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      channel.published
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {channel.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(channel)}
                    title="Edit Channel Details"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete channel "${channel.title}"?`)) {
                        deleteChannel(channel.id);
                      }
                    }}
                    title="Delete Channel"
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CHANNEL MODAL */}
      {channelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900">
              {channelModal.isEditing ? 'Edit Learning Channel' : 'Create New Learning Channel'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Title</label>
              <input
                type="text"
                value={channelModal.title}
                onChange={(e) => setChannelModal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Bancassurance Channel Mastery"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Curriculum Course (Optional)</label>
              <select
                value={channelModal.course_id}
                onChange={(e) => setChannelModal((prev) => ({ ...prev, course_id: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              >
                <option value="">Standalone Channel (No course link)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Description</label>
              <textarea
                rows={3}
                value={channelModal.description}
                onChange={(e) => setChannelModal((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief summary of channel directives..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Index</label>
                <input
                  type="number"
                  value={channelModal.order_index}
                  onChange={(e) => setChannelModal((prev) => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={channelModal.thumbnail_url}
                  onChange={(e) => setChannelModal((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={channelModal.tagsText}
                onChange={(e) => setChannelModal((prev) => ({ ...prev, tagsText: e.target.value }))}
                placeholder="Bancassurance, Branch Advisors, Underwriting"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Highlights / Cards (One per line)
              </label>
              <textarea
                rows={3}
                value={channelModal.highlightsText}
                onChange={(e) => setChannelModal((prev) => ({ ...prev, highlightsText: e.target.value }))}
                placeholder="Highlight 1&#10;Highlight 2"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="channel_published"
                checked={channelModal.published}
                onChange={(e) => setChannelModal((prev) => ({ ...prev, published: e.target.checked }))}
                className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98]"
              />
              <label htmlFor="channel_published" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Publish channel immediately
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setChannelModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChannel}
                disabled={!channelModal.title.trim()}
                className="px-4 py-2 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {channelModal.isEditing ? 'Save Changes' : 'Create Channel in Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHORIZED LEARNERS MODAL */}
      {selectedChannelForUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            <div className="bg-[#176B98] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Channel Access: {selectedChannelForUsers.title}</h3>
                <p className="text-xs text-sky-100">View and grant channel permissions for this stream</p>
              </div>
              <button
                onClick={() => setSelectedChannelForUsers(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Authorized Employees ({channelAccesses.filter((ca) => ca.channel_id === selectedChannelForUsers.id && ca.status === 'granted').length})
                </span>
                <button
                  onClick={() =>
                    setAssignUserModal({
                      isOpen: true,
                      channelId: selectedChannelForUsers.id,
                      selectedUserId: profiles[1]?.id || '',
                      expiresAt: '',
                      note: '',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Grant Channel Access</span>
                </button>
              </div>

              <div className="space-y-2">
                {channelAccesses
                  .filter((ca) => ca.channel_id === selectedChannelForUsers.id)
                  .map((ca) => {
                    const user = profiles.find((p) => p.id === ca.user_id);
                    const isRevoked = ca.status === 'revoked';

                    return (
                      <div
                        key={ca.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isRevoked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              user?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                            }
                            alt={user?.full_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{user?.full_name || 'Unknown User'}</p>
                            <p className="text-[11px] text-slate-500">{user?.email}</p>
                            {ca.expires_at && (
                              <p className="text-[10px] text-amber-600 mt-0.5">
                                Expires: {new Date(ca.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {isRevoked ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-700 uppercase">
                              Revoked
                            </span>
                          ) : (
                            <button
                              onClick={() => revokeChannel(ca.user_id, ca.channel_id)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN USER MODAL */}
      {assignUserModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Grant Channel Permission</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
              <select
                value={assignUserModal.selectedUserId}
                onChange={(e) => setAssignUserModal((prev) => ({ ...prev, selectedUserId: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.email}) - {p.account_status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Access Expiration Date (Optional)</label>
              <input
                type="date"
                value={assignUserModal.expiresAt}
                onChange={(e) => setAssignUserModal((prev) => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Note</label>
              <input
                type="text"
                placeholder="e.g. Branch Relationship Advisor cohort"
                value={assignUserModal.note}
                onChange={(e) => setAssignUserModal((prev) => ({ ...prev, note: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssignUserModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUser}
                className="px-4 py-2 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Grant Channel Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
