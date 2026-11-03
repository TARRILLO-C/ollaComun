import { Pool } from 'pg';

export interface NearbyDonationDTO {
  donationId: string;
  title: string;
  category: string;
  quantityValue: number;
  unitMeasure: string;
  pickupStartAt: Date;
  pickupEndAt: Date;
  donorBusinessName: string;
  donorPhone: string;
  donorAddress: string;
  distanceMeters: number;
}

export class PgDonationRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Ejecuta consulta geoespacial nativa usando PostGIS (ST_DWithin y ST_Distance)
   * para hallar donaciones activas dentro de un radio en metros.
   */
  async findNearby(latitude: number, longitude: number, radiusMeters: number = 5000): Promise<NearbyDonationDTO[]> {
    const query = `
      SELECT 
        d.id AS "donationId",
        d.title,
        d.category,
        d.quantity_value AS "quantityValue",
        d.unit_measure AS "unitMeasure",
        d.pickup_start_at AS "pickupStartAt",
        d.pickup_end_at AS "pickupEndAt",
        u.business_name AS "donorBusinessName",
        u.phone AS "donorPhone",
        u.address_line AS "donorAddress",
        ROUND(
          ST_Distance(
            d.location, 
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          )::numeric, 
          1
        )::float AS "distanceMeters"
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      WHERE d.status = 'AVAILABLE'
        AND d.pickup_end_at > NOW()
        AND ST_DWithin(
          d.location, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
          $3
        )
      ORDER BY "distanceMeters" ASC;
    `;

    // Nota: PostGIS ST_MakePoint recibe primero (Longitud, Latitud)
    const { rows } = await this.pool.query(query, [longitude, latitude, radiusMeters]);
    return rows;
  }
}
