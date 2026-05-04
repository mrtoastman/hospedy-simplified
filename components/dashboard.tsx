'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  max_guests: number;
  nightly_rate: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface Reservation {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
}

export default function DashboardContent({ user }: { user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // New property form
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: 'house',
    max_guests: 4,
    nightly_rate: 0,
  });

  // New reservation form
  const [newReservation, setNewReservation] = useState({
    property_id: '',
    guest_name: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    total_price: 0,
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load properties
      const { data: propertiesData, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (propsError) throw propsError;
      setProperties(propertiesData || []);

      // Load reservations
      const { data: reservationsData, error: resvError } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in', { ascending: false });

      if (resvError) throw resvError;
      setReservations(reservationsData || []);

      // Load guests
      const { data: guestsData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (guestError) throw guestError;
      setGuests(guestsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleAddProperty = async () => {
    if (!newProperty.name || !newProperty.address) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            ...newProperty,
            user_id: user.id,
            status: 'active',
          },
        ])
        .select();

      if (error) throw error;

      setProperties([...properties, data[0]]);
      setShowNewPropertyModal(false);
      setNewProperty({
        name: '',
        address: '',
        type: 'house',
        max_guests: 4,
        nightly_rate: 0,
      });
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Error al agregar propiedad');
    }
  };

  const handleAddReservation = async () => {
    if (
      !newReservation.property_id ||
      !newReservation.guest_name ||
      !newReservation.check_in ||
      !newReservation.check_out
    ) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            ...newReservation,
            user_id: user.id,
            status: 'pending',
          },
        ])
        .select();

      if (error) throw error;

      setReservations([...reservations, data[0]]);
      setShowNewReservationModal(false);
      setNewReservation({
        property_id: '',
        guest_name: '',
        guest_email: '',
        check_in: '',
        check_out: '',
        total_price: 0,
      });
    } catch (error) {
      console.error('Error adding reservation:', error);
      alert('Error al agregar reserva');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/app/login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  const stats = {
    totalProperties: properties.length,
    activeReservations: reservations.filter(
      (r) => r.status === 'confirmed'
    ).length,
    totalGuests: guests.length,
    monthlyRevenue: reservations
      .filter((r) => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.total_price || 0), 0),
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Hospedy</h1>
          <div className={styles.userSection}>
            <span className={styles.userName}>{user?.email}</span>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${
                activeTab === 'overview' ? styles.active : ''
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Resumen
            </button>
            <button
              className={`${styles.navItem} ${
                activeTab === 'properties' ? styles.active : ''
              }`}
              onClick={() => setActiveTab('properties')}
            >
              Propiedades
            </button>
            <button
              className={`${styles.navItem} ${
                activeTab === 'reservations' ? styles.active : ''
              }`}
              onClick={() => setActiveTab('reservations')}
            >
              Reservas
            </button>
            <button
              className={`${styles.navItem} ${
                activeTab === 'guests' ? styles.active : ''
              }`}
              onClick={() => setActiveTab('guests')}
            >
              Huéspedes
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Resumen General</h2>
              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Propiedades</div>
                  <div className={styles.statValue}>{stats.totalProperties}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Reservas Activas</div>
                  <div className={styles.statValue}>
                    {stats.activeReservations}
                  </div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Total Huéspedes</div>
                  <div className={styles.statValue}>{stats.totalGuests}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Ingresos Mes</div>
                  <div className={styles.statValue}>
                    {formatCurrency(stats.monthlyRevenue)}
                  </div>
                </div>
              </div>

              {/* Recent Reservations */}
              <div className={styles.section}>
                <h3 className={styles.subsectionTitle}>Reservas Recientes</h3>
                {reservations.length === 0 ? (
                  <p className={styles.emptyMessage}>
                    No hay reservas. Crea una nueva.
                  </p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Propiedad</th>
                        <th>Huésped</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Estado</th>
                        <th>Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.slice(0, 5).map((r) => (
                        <tr key={r.id}>
                          <td>{r.property_id}</td>
                          <td>{r.guest_name}</td>
                          <td>{formatDate(r.check_in)}</td>
                          <td>{formatDate(r.check_out)}</td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                styles[`badge-${r.status}`]
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>{formatCurrency(r.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Mis Propiedades</h2>
                <button
                  className={styles.primaryBtn}
                  onClick={() => setShowNewPropertyModal(true)}
                >
                  + Nueva Propiedad
                </button>
              </div>

              {properties.length === 0 ? (
                <p className={styles.emptyMessage}>
                  No tienes propiedades. Crea una nueva.
                </p>
              ) : (
                <div className={styles.propertiesGrid}>
                  {properties.map((prop) => (
                    <div key={prop.id} className={styles.propertyCard}>
                      <div className={styles.cardHeader}>
                        <h3>{prop.name}</h3>
                        <span
                          className={`${styles.badge} ${
                            styles[
                              `badge-${
                                prop.status === 'active' ? 'confirmed' : 'cancelled'
                              }`
                            ]
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                      <p className={styles.cardSubtext}>{prop.address}</p>
                      <div className={styles.cardDetails}>
                        <div>
                          <span className={styles.label}>Tipo:</span>
                          {prop.type}
                        </div>
                        <div>
                          <span className={styles.label}>Huéspedes:</span>
                          {prop.max_guests}
                        </div>
                        <div>
                          <span className={styles.label}>Tarifa:</span>
                          {formatCurrency(prop.nightly_rate)}/noche
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Property Modal */}
              {showNewPropertyModal && (
                <div className={styles.modal}>
                  <div className={styles.modalContent}>
                    <h3>Nueva Propiedad</h3>
                    <div className={styles.formGroup}>
                      <label>Nombre</label>
                      <input
                        type="text"
                        value={newProperty.name}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Dirección</label>
                      <input
                        type="text"
                        value={newProperty.address}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tipo</label>
                      <select
                        value={newProperty.type}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            type: e.target.value,
                          })
                        }
                      >
                        <option value="house">Casa</option>
                        <option value="apartment">Apartamento</option>
                        <option value="villa">Villa</option>
                        <option value="cabin">Cabaña</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Máximo de huéspedes</label>
                      <input
                        type="number"
                        value={newProperty.max_guests}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            max_guests: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tarifa por noche (COP)</label>
                      <input
                        type="number"
                        value={newProperty.nightly_rate}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            nightly_rate: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className={styles.modalButtons}>
                      <button
                        className={styles.primaryBtn}
                        onClick={handleAddProperty}
                      >
                        Guardar
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => setShowNewPropertyModal(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Reservas</h2>
                <button
                  className={styles.primaryBtn}
                  onClick={() => setShowNewReservationModal(true)}
                >
                  + Nueva Reserva
                </button>
              </div>

              {reservations.length === 0 ? (
                <p className={styles.emptyMessage}>
                  No tienes reservas. Crea una nueva.
                </p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Propiedad</th>
                      <th>Huésped</th>
                      <th>Email</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Estado</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id}>
                        <td>{r.property_id}</td>
                        <td>{r.guest_name}</td>
                        <td>{r.guest_email}</td>
                        <td>{formatDate(r.check_in)}</td>
                        <td>{formatDate(r.check_out)}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              styles[`badge-${r.status}`]
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td>{formatCurrency(r.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* New Reservation Modal */}
              {showNewReservationModal && (
                <div className={styles.modal}>
                  <div className={styles.modalContent}>
                    <h3>Nueva Reserva</h3>
                    <div className={styles.formGroup}>
                      <label>Propiedad</label>
                      <select
                        value={newReservation.property_id}
                        onChange={(e) =>
                          setNewReservation({
                            ...newReservation,
                            property_id: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecciona una propiedad</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Nombre del Huésped</label>
                      <input
                        type="text"
                        value={newReservation.guest_name}
                        onChange={(e) =>
                          setNewReservation({
                            ...newReservation,
                            guest_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email del Huésped</label>
                      <input
                        type="email"
                        value={newReservation.guest_email}
                        onChange={(e) =>
                          setNewReservation({
                            ...newReservation,
                            guest_email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Check-in</label>
                      <input
                        type="date"
                        value={newReservation.check_in}
                        onChange={(e) =>
                          setNewReservation({
                            ...newReservation,
                            check_in: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Check-out</label>
                      <input
                        type="date"
                        value={newReservation.check_out}
                        onChange={(e) =>
                          setNewReservation({
                            ...newReservation,
                            check_out: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Precio Total (COP)</label>
                      <input
                        type="number"
                        value={newReservation.total_price}
                        onChange={(e) =>
                          setNewReservation({
                            ...newReservation,
                            total_price: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className={styles.modalButtons}>
                      <button
                        className={styles.primaryBtn}
                        onClick={handleAddReservation}
                      >
                        Guardar
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => setShowNewReservationModal(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Guests Tab */}
          {activeTab === 'guests' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Huéspedes</h2>

              {guests.length === 0 ? (
                <p className={styles.emptyMessage}>
                  No tienes huéspedes registrados.
                </p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>País</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g) => (
                      <tr key={g.id}>
                        <td>{g.name}</td>
                        <td>{g.email}</td>
                        <td>{g.phone}</td>
                        <td>{g.country}</td>
                        <td>{formatDate(g.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
